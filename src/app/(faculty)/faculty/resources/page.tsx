'use client';

import * as React from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Drawer } from '@/components/ui/drawer';
import { 
  BookOpen, BadgePercent, LifeBuoy, Briefcase, Plus, CheckCircle, 
  ChevronDown, ChevronRight, Search, Eye, Edit, Activity, Archive
} from 'lucide-react';

const CATEGORIES = [
  {
    id: 'learning',
    title: 'Learning Resources',
    icon: BookOpen,
    subcategories: ['All Learning Resources', 'Study Materials', 'Video Lectures', 'Practice & Tests', 'Assignments', 'Remedial Resources'],
  },
  {
    id: 'financial',
    title: 'Financial Resources',
    icon: BadgePercent,
    subcategories: ['All Financial Resources', 'Scholarships', 'Fee Assistance', 'Education Loans', 'Financial Aid'],
  },
  {
    id: 'support',
    title: 'Support Resources',
    icon: LifeBuoy,
    subcategories: ['All Support Resources', 'Counseling', 'Mentoring', 'Student Welfare', 'Accessibility Support'],
  },
  {
    id: 'career',
    title: 'Career Resources',
    icon: Briefcase,
    subcategories: ['All Career Resources', 'Internships', 'Placements', 'Certifications', 'Career Guidance'],
  }
];

export default function FacultyResourcesPage() {
  const [activeTab, setActiveTab] = React.useState('learning');
  const [activeSub, setActiveSub] = React.useState('All Learning Resources');
  const [expandedCats, setExpandedCats] = React.useState<string[]>(['learning']);
  
  const [resources, setResources] = React.useState<any[]>([]);
  const [search, setSearch] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(true);
  
  // Drawer state
  const [selectedResource, setSelectedResource] = React.useState<any | null>(null);

  const fetchResources = React.useCallback(() => {
    setIsLoading(true);
    fetch(`/api/faculty/resources?category=${activeTab}`)
      .then((res) => res.json())
      .then((data) => {
        setResources(data.resources || []);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, [activeTab]);

  React.useEffect(() => {
    fetchResources();
  }, [fetchResources]);

  const toggleCat = (catId: string) => {
    setExpandedCats(prev => 
      prev.includes(catId) ? prev.filter(id => id !== catId) : [...prev, catId]
    );
  };

  const handleSubClick = (catId: string, sub: string) => {
    setActiveTab(catId);
    setActiveSub(sub);
  };

  const handleRemove = async (id: string) => {
    if (confirm('Are you sure you want to archive/delete this resource?')) {
      try {
        await fetch(`/api/faculty/resources?id=${id}`, { method: 'DELETE' });
        setResources(prev => prev.filter(r => r.id !== id));
      } catch (err) {
        setResources(prev => prev.filter(r => r.id !== id));
      }
    }
  };

  const filteredResources = resources.filter(res => {
    if (!search) return true;
    const term = search.toLowerCase();
    return (
      (res.title || res.name || '').toLowerCase().includes(term) ||
      (res.description || '').toLowerCase().includes(term) ||
      (res.subject || '').toLowerCase().includes(term) ||
      (res.provider || '').toLowerCase().includes(term)
    );
  });

  return (
    <div className="flex h-[calc(100vh-4rem)] -m-6 bg-slate-50/50">
      {/* Left Sidebar */}
      <aside className="w-64 border-r border-slate-200 bg-white flex flex-col h-full overflow-y-auto">
        <div className="p-4 border-b border-slate-100">
          <h3 className="font-semibold text-slate-800">Resource Catalog</h3>
          <p className="text-xs text-slate-400 mt-0.5">Faculty Management Portal</p>
        </div>
        <div className="p-2 space-y-1">
          {CATEGORIES.map(cat => {
            const Icon = cat.icon;
            const isExpanded = expandedCats.includes(cat.id);
            const isActiveCat = activeTab === cat.id;
            
            return (
              <div key={cat.id} className="mb-2">
                <button 
                  onClick={() => toggleCat(cat.id)}
                  className={`w-full flex items-center justify-between p-2 rounded-lg text-sm transition-colors ${
                    isActiveCat ? 'bg-indigo-50 text-indigo-700 font-medium' : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4" />
                    <span>{cat.title}</span>
                  </div>
                  {isExpanded ? <ChevronDown className="h-4 w-4 opacity-50" /> : <ChevronRight className="h-4 w-4 opacity-50" />}
                </button>
                
                {isExpanded && (
                  <div className="mt-1 ml-6 space-y-1 border-l border-slate-100 pl-2">
                    {cat.subcategories.map(sub => (
                      <button
                        key={sub}
                        onClick={() => handleSubClick(cat.id, sub)}
                        className={`w-full text-left px-2 py-1.5 text-[13px] rounded transition-colors ${
                          activeTab === cat.id && activeSub === sub 
                            ? 'text-indigo-700 font-medium bg-indigo-50/50' 
                            : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                        }`}
                      >
                        {sub}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden bg-white">
        {/* Top Header */}
        <div className="p-6 border-b border-slate-100 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                {CATEGORIES.find(c => c.id === activeTab)?.title}
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Manage, publish, and target educational and welfare resources for your students.
              </p>
            </div>
            <Link href="/faculty/resources/add">
              <Button className="gap-1.5 text-xs">
                <Plus className="h-4 w-4" />
                <span>Add Resource</span>
              </Button>
            </Link>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
            <div className="relative lg:col-span-2">
              <Search className="h-4 w-4 absolute left-3 top-3 text-slate-400" />
              <Input 
                placeholder="Search resources..." 
                className="pl-9 text-xs" 
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <Select
              value="all_depts"
              onChange={() => {}}
              options={[{ value: 'all_depts', label: 'All Departments' }, { value: 'cse', label: 'CSE' }, { value: 'it', label: 'IT' }]}
            />
            <Select
              value="all_progs"
              onChange={() => {}}
              options={[{ value: 'all_progs', label: 'All Programs' }, { value: 'btech', label: 'B.Tech' }]}
            />
            <Select
              value="all_risks"
              onChange={() => {}}
              options={[{ value: 'all_risks', label: 'Any Risk Level' }, { value: 'high', label: 'High Risk' }]}
            />
            <Select
              value="active"
              onChange={() => {}}
              options={[{ value: 'active', label: 'Active' }, { value: 'draft', label: 'Draft' }]}
            />
          </div>
        </div>

        {/* Table Area */}
        <div className="flex-1 overflow-auto p-6">
          <Card className="border-slate-200">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50/50">
                  <TableHead>Resource Title</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Provider</TableHead>
                  <TableHead>Target Dept</TableHead>
                  <TableHead>Risk Target</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-slate-400 text-xs">
                      Loading resources...
                    </TableCell>
                  </TableRow>
                ) : filteredResources.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-slate-400 text-xs">
                      No resources found for this category.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredResources.map((res: any) => (
                    <TableRow key={res.id}>
                      <TableCell>
                        <div className="font-semibold text-slate-900 text-sm">
                          {res.title || res.name}
                        </div>
                        <div className="text-[11px] text-slate-500 line-clamp-1">
                          {res.description || res.subject || res.specialization || res.benefit}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-xs font-mono uppercase bg-slate-100 px-2 py-0.5 rounded text-slate-700">
                          {res.type || res.resource_type || 'N/A'}
                        </span>
                      </TableCell>
                      <TableCell className="text-xs text-slate-600">
                        {res.provider || res.uploaded_by || res.organization || 'Faculty'}
                      </TableCell>
                      <TableCell className="text-xs text-slate-500">All</TableCell>
                      <TableCell>
                        <span className="text-[10px] font-bold uppercase bg-amber-50 text-amber-700 px-2 py-0.5 rounded border border-amber-200">
                          {res.target_risk || 'Moderate'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                          <CheckCircle className="h-3 w-3 text-emerald-600" />
                          Published
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button size="sm" variant="ghost" className="h-8 px-2 text-xs" onClick={() => setSelectedResource(res)} title="View">
                            <Eye className="h-3.5 w-3.5 text-slate-500" />
                          </Button>
                          <Button size="sm" variant="ghost" className="h-8 px-2 text-xs" title="Edit">
                            <Edit className="h-3.5 w-3.5 text-indigo-500" />
                          </Button>
                          <Button size="sm" variant="ghost" className="h-8 px-2 text-xs" title="Analytics">
                            <Activity className="h-3.5 w-3.5 text-blue-500" />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => handleRemove(res.id)} className="h-8 px-2 text-xs hover:bg-red-50 hover:text-red-600 transition-colors" title="Archive">
                            <Archive className="h-3.5 w-3.5 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Card>
        </div>
      </main>

      {/* Resource Detail Drawer */}
      <Drawer
        isOpen={!!selectedResource}
        onClose={() => setSelectedResource(null)}
        title={selectedResource?.title || selectedResource?.name || 'Resource Details'}
        description={`Category: ${activeTab.toUpperCase()}`}
        width="lg"
      >
        {selectedResource && (
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="flex gap-2">
              <Button size="sm" className="gap-1.5"><Edit className="h-3.5 w-3.5"/> Edit</Button>
              <Button size="sm" variant="outline" className="gap-1.5"><Archive className="h-3.5 w-3.5"/> Archive</Button>
              <Button size="sm" variant="outline" className="gap-1.5"><Activity className="h-3.5 w-3.5"/> Analytics</Button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <div className="text-xs text-slate-500 mb-1">Resource Type</div>
                <div className="font-semibold">{selectedResource.type || selectedResource.resource_type || 'N/A'}</div>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <div className="text-xs text-slate-500 mb-1">Provider</div>
                <div className="font-semibold">{selectedResource.provider || selectedResource.uploaded_by || selectedResource.organization || 'Faculty'}</div>
              </div>
            </div>
            
            <div>
              <h4 className="text-xs font-bold uppercase text-slate-400 mb-2">Description</h4>
              <p className="text-slate-700 text-sm">
                {selectedResource.description || selectedResource.subject || selectedResource.benefit || 'No detailed description provided.'}
              </p>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase text-slate-400 mb-2">Target Audience & Recommendations</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500 w-24">Risk Level:</span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">Moderate & High</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500 w-24">Condition:</span>
                  <span className="text-xs font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-700">Attendance &lt; 75% AND GPA &lt; 6.0</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase text-slate-400 mb-2">Usage Analytics (Mock)</h4>
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 border rounded-lg text-center">
                  <div className="text-2xl font-bold text-indigo-600">142</div>
                  <div className="text-[10px] uppercase font-semibold text-slate-500 mt-1">Recommendations</div>
                </div>
                <div className="p-3 border rounded-lg text-center">
                  <div className="text-2xl font-bold text-emerald-600">89</div>
                  <div className="text-[10px] uppercase font-semibold text-slate-500 mt-1">Unique Students</div>
                </div>
                <div className="p-3 border rounded-lg text-center">
                  <div className="text-2xl font-bold text-blue-600">62%</div>
                  <div className="text-[10px] uppercase font-semibold text-slate-500 mt-1">Conversion</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
}
