import * as fs from 'fs';
import * as path from 'path';
import { generate100Students, buildExcelFile } from './generate_and_import_100_students';
import { ImportService } from '../src/lib/services/import.service';
import { studentService } from '../src/lib/services/student.service';
import { clearDemoStudents, getDemoStudents } from '../src/lib/store/demo-students';
import { checkUserPassword } from '../src/lib/store/auth-credentials';
import { institutionalEngineService } from '../src/lib/services/institutional-engine.service';
import { createSupabaseServiceClient } from '../src/lib/supabase/server';

async function main() {
  console.log('================================================================');
  console.log(' PRISM-EDU: 100 STUDENTS BATCH GENERATION, IMPORT & ALGORITHM TEST');
  console.log('================================================================\n');

  // STEP 1: Clear existing static / demo student data
  console.log('[Step 1] Clearing existing static and demo student records...');
  clearDemoStudents();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const isLiveDb = !!(supabaseUrl && !supabaseUrl.includes('your-project') && !supabaseUrl.includes('test.supabase'));

  if (isLiveDb) {
    try {
      const supabase = createSupabaseServiceClient();
      // Remove any existing student accounts from public.students and public.users (role = 'student')
      const { data: existingStudents } = await supabase.from('students').select('id, user_id');
      if (existingStudents && existingStudents.length > 0) {
        console.log(`[Supabase] Removing ${existingStudents.length} prior student records from live database...`);
        const studentUserIds = existingStudents.map((s) => s.user_id).filter(Boolean);
        await supabase.from('students').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        if (studentUserIds.length > 0) {
          await supabase.from('users').delete().in('id', studentUserIds);
        }
      }
      console.log('[Supabase] Live database students cleaned. Admin and faculty accounts preserved.');
    } catch (dbErr: any) {
      console.warn('[Supabase Cleanup Notice]:', dbErr.message);
    }
  }

  // STEP 2: Generate 100 Students and create PRISM_Students_100_Cohort.xlsx
  console.log('\n[Step 2] Generating 100 comprehensive student profiles...');
  const studentsList = generate100Students();
  const excelFilePath = path.join(process.cwd(), 'PRISM_Students_100_Cohort.xlsx');
  buildExcelFile(studentsList, excelFilePath);

  console.log(`[Excel Output] File created successfully: ${excelFilePath}`);
  console.log(`[Sample Row 1]: ID: ${studentsList[0].student_id}, Name: ${studentsList[0].full_name}, Email: ${studentsList[0].email}, DOB: ${studentsList[0].date_of_birth}, Pass: ${studentsList[0].initialPassword}`);

  // STEP 3: Process through the Application Import Pipeline
  console.log('\n[Step 3] Running batch import through App Import Pipeline...');
  const fileBuffer = fs.readFileSync(excelFilePath);
  const importService = new ImportService();

  // 3a. Header parsing & Tag matching
  console.log('-> Parsing Excel file buffer and mapping header tags...');
  const parseResult = importService.parseFileWithTags(fileBuffer);
  console.log(`-> Parsed ${parseResult.rows.length} rows. Tag mappings matched: ${parseResult.tagMappings.filter(t => t.matched).length}/${parseResult.tagMappings.length}`);

  // 3b. Schema validation & duplicate checking
  console.log('-> Validating student attributes & constraints...');
  const validation = importService.validateRows(parseResult.rows, new Set());
  console.log(`-> Validation summary: Total: ${validation.totalRows} | Valid: ${validation.validRows} | Invalid: ${validation.invalidRows} | Errors: ${validation.errors.length}`);

  if (validation.errors.length > 0) {
    console.error('Validation errors encountered:', validation.errors.slice(0, 5));
    throw new Error('Import validation failed with errors');
  }

  // 3c. Confirm and import validated students
  console.log('-> Confirming batch import into user auth registry & student profiles...');
  const facultyId = 'f1111111-1111-1111-1111-111111111111'; // Dr. Sarah Mitchell
  const importResult = await studentService.importValidatedStudents(validation.valid, facultyId);

  console.log(`-> Successfully imported ${importResult.createdCount} student profile(s) with initial assessment triggered.`);

  // STEP 4: Verify Student Records & Authentication Credentials
  console.log('\n[Step 4] Verifying Student Records and Authentication...');
  const activeStudents = getDemoStudents();
  console.log(`-> Active students in platform cohort store: ${activeStudents.length}`);

  // Test authentication for 5 diverse student accounts
  const testIndices = [0, 10, 25, 50, 99];
  let authPassCount = 0;

  for (const idx of testIndices) {
    const s = studentsList[idx];
    const emailLoginValid = checkUserPassword(s.email, s.initialPassword, s.date_of_birth, s.full_name);
    console.log(`   * Testing Auth: [${s.student_id}] ${s.full_name} (${s.email})`);
    console.log(`     Password formula (${s.initialPassword}): ${emailLoginValid ? '✓ AUTHENTICATED' : '✗ FAILED'}`);
    if (emailLoginValid) authPassCount++;
  }

  console.log(`-> Authentication verification rate: ${authPassCount}/${testIndices.length} sample accounts passed.`);

  // STEP 5: Test Analytics & Algorithmic Prediction Features
  console.log('\n[Step 5] Testing Institutional Analytics & ML Algorithms on Imported Cohort...');
  const dashboard = await institutionalEngineService.getCalculatedDashboard();

  console.log('================================================================');
  console.log(' ALGORITHM & ANALYTICS TEST RESULTS');
  console.log('================================================================');
  console.log(`Total Cohort Size:            ${dashboard.metrics.totalStudentsDisplay}`);
  console.log(`High-Risk Students:           ${dashboard.metrics.highRiskStudents} (${dashboard.metrics.highRiskSubtitle})`);
  console.log(`Emerging-Risk Students:       ${dashboard.metrics.emergingRiskStudents} (${dashboard.metrics.emergingRiskSubtitle})`);
  console.log(`Require Attention Students:   ${dashboard.metrics.requireAttentionStudents}`);
  console.log(`Intervention Success Rate:    ${dashboard.metrics.interventionSuccessDisplay}`);

  console.log('\n--- Predicted Risk Distribution ---');
  dashboard.riskDistribution.categories.forEach((cat) => {
    console.log(`  ${cat.name.padEnd(16)}: ${String(cat.value).padStart(3)} students (${cat.percentage})`);
  });

  console.log('\n--- Department Risk Overview ---');
  dashboard.departmentRisks.forEach((dept) => {
    console.log(`  ${dept.name.padEnd(40)}: ${dept.percentage}% at risk (${dept.atRisk}/${dept.total} students)`);
  });

  console.log('\n--- Priority Action Center ---');
  dashboard.priorityActions.forEach((pa) => {
    console.log(`  [${pa.id.toUpperCase()}] ${pa.title.padEnd(32)}: ${pa.count}`);
  });

  console.log('\n--- Top Priority Attention Students ---');
  dashboard.attentionStudents.slice(0, 5).forEach((stu, i) => {
    console.log(`  ${i + 1}. [${stu.department}] ${stu.name.padEnd(22)} Risk: ${stu.riskScore} | Att: ${stu.attendance} | CGPA: ${stu.cgpa} | Trend: ${stu.trend}`);
  });

  console.log('\n--- Top Emerging Risk Surge Students ---');
  dashboard.emergingStudents.slice(0, 5).forEach((stu, i) => {
    console.log(`  ${i + 1}. [${stu.department}] ${stu.name.padEnd(22)} Current: ${stu.current} (Prev: ${stu.previous}) Surge: ${stu.change}`);
  });

  // STEP 6: Save Credentials Manifest for user reference
  const credentialsManifest = studentsList.map((s) => ({
    student_id: s.student_id,
    full_name: s.full_name,
    email: s.email,
    password: s.initialPassword,
    date_of_birth: s.date_of_birth,
    department: s.department_code,
    academic_year: s.academic_year,
    attendance: `${s.attendance_percentage}%`,
    previous_gpa: s.previous_gpa,
    previous_backlogs: s.previous_backlogs,
    annual_income: s.family_income,
    financial_assistance: s.financial_assistance
  }));

  const manifestPath = path.join(process.cwd(), 'PRISM_Students_100_Credentials.json');
  fs.writeFileSync(manifestPath, JSON.stringify(credentialsManifest, null, 2));
  console.log(`\n[Credentials Manifest] Saved all 100 logins & passwords to: ${manifestPath}`);

  console.log('\n================================================================');
  console.log(' ALL TASKS COMPLETED SUCCESSFULLY!');
  console.log(' Excel Sheet: PRISM_Students_100_Cohort.xlsx');
  console.log(' Credentials: PRISM_Students_100_Credentials.json');
  console.log('================================================================');
}

main().catch((err) => {
  console.error('\n[Error executing pipeline]:', err);
  process.exit(1);
});
