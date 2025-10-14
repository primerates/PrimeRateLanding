import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ChevronDown } from 'lucide-react';

interface DashboardFiltersProps {
  entityFilter: string;
  setEntityFilter: (value: string) => void;
  categoryFilter: string;
  setCategoryFilter: (value: string) => void;
  teamFilter: string;
  setTeamFilter: (value: string) => void;
  timeFilter: string;
  setTimeFilter: (value: string) => void;
  timeFilterFromDate: string;
  handleTimeFilterDateInput: (e: React.ChangeEvent<HTMLInputElement>, field: 'from' | 'to') => void;
  timeFilterToDate: string;
}

export function DashboardFilters({
  entityFilter,
  setEntityFilter,
  categoryFilter,
  setCategoryFilter,
  teamFilter,
  setTeamFilter,
  timeFilter,
  setTimeFilter,
  timeFilterFromDate,
  handleTimeFilterDateInput,
  timeFilterToDate
}: DashboardFiltersProps) {
  return (
    <div className="flex flex-wrap items-center gap-4 mb-6">
      {/* Category Filter Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className="bg-purple-500/20 hover:bg-purple-500/40 text-white px-4 py-2 rounded-lg border border-purple-500/30 hover:border-purple-500/50 transition-all min-w-[150px] text-left flex items-center justify-between text-sm"
            data-testid="select-category-filter"
          >
            <span>
              {categoryFilter === 'financials' && 'Financials'}
              {categoryFilter === 'direct-mail' && 'Direct Mail'}
              {categoryFilter === 'lead-vendor' && 'Lead Vendor'}
              {categoryFilter === 'social-media' && 'Social Media'}
              {categoryFilter === 'staff' && 'Staff'}
              {categoryFilter === 'vendor' && 'Vendor'}
            </span>
            <ChevronDown className="h-4 w-4 ml-2" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-[150px] bg-slate-800/95 backdrop-blur-xl border-purple-500/30">
          <DropdownMenuItem
            onClick={() => {
              setCategoryFilter('financials');
              setTeamFilter('select');
            }}
            className="cursor-pointer text-purple-200 hover:!bg-gradient-to-r hover:!from-purple-600 hover:!to-pink-600 hover:!text-white focus:!bg-gradient-to-r focus:!from-purple-600 focus:!to-pink-600 focus:!text-white transition-all"
            data-testid="option-category-financials"
          >
            Financials
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              setCategoryFilter('direct-mail');
              setTeamFilter('va');
            }}
            className="cursor-pointer text-purple-200 hover:!bg-gradient-to-r hover:!from-purple-600 hover:!to-pink-600 hover:!text-white focus:!bg-gradient-to-r focus:!from-purple-600 focus:!to-pink-600 focus:!text-white transition-all"
            data-testid="option-category-direct-mail"
          >
            Direct Mail
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              setCategoryFilter('lead-vendor');
              setTeamFilter('select');
            }}
            className="cursor-pointer text-purple-200 hover:!bg-gradient-to-r hover:!from-purple-600 hover:!to-pink-600 hover:!text-white focus:!bg-gradient-to-r focus:!from-purple-600 focus:!to-pink-600 focus:!text-white transition-all"
            data-testid="option-category-lead-vendor"
          >
            Lead Vendor
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              setCategoryFilter('social-media');
              setTeamFilter('facebook');
            }}
            className="cursor-pointer text-purple-200 hover:!bg-gradient-to-r hover:!from-purple-600 hover:!to-pink-600 hover:!text-white focus:!bg-gradient-to-r focus:!from-purple-600 focus:!to-pink-600 focus:!text-white transition-all"
            data-testid="option-category-social-media"
          >
            Social Media
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              setCategoryFilter('staff');
              setTeamFilter('team');
            }}
            className="cursor-pointer text-purple-200 hover:!bg-gradient-to-r hover:!from-purple-600 hover:!to-pink-600 hover:!text-white focus:!bg-gradient-to-r focus:!from-purple-600 focus:!to-pink-600 focus:!text-white transition-all"
            data-testid="option-category-staff"
          >
            Staff
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              setCategoryFilter('vendor');
              setTeamFilter('select');
            }}
            className="cursor-pointer text-purple-200 hover:!bg-gradient-to-r hover:!from-purple-600 hover:!to-pink-600 hover:!text-white focus:!bg-gradient-to-r focus:!from-purple-600 focus:!to-pink-600 focus:!text-white transition-all"
            data-testid="option-category-vendor"
          >
            Vendor
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Team Filter Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className="bg-purple-500/20 hover:bg-purple-500/40 text-white px-4 py-2 rounded-lg border border-purple-500/30 hover:border-purple-500/50 transition-all min-w-[130px] text-left flex items-center justify-between text-sm"
            data-testid="select-team-filter"
          >
            <span>
              {teamFilter === 'select' && 'Select'}
              {teamFilter === 'pl' && 'P & L'}
              {teamFilter === 'va' && 'VA'}
              {teamFilter === 'va-jumbo' && 'VA Jumbo'}
              {teamFilter === 'fnm' && 'FNM'}
              {teamFilter === 'fnm-jumbo' && 'FNM Jumbo'}
              {teamFilter === 'fha' && 'FHA'}
              {teamFilter === 'non-qm' && 'Non-QM'}
              {teamFilter === 'tbd' && 'TBD'}
              {teamFilter === 'facebook' && 'Facebook'}
              {teamFilter === 'x' && 'X'}
              {teamFilter === 'ig' && 'IG'}
              {teamFilter === 'tiktok' && 'Tik Tok'}
              {teamFilter === 'youtube' && 'YouTube'}
              {teamFilter === 'team' && 'Team'}
              {teamFilter === 'team-lead' && 'Team Lead'}
              {teamFilter === 'mlo' && 'MLO'}
              {teamFilter === 'processor' && 'Processor'}
              {teamFilter === 'uw' && 'UW'}
              {teamFilter === 'funder' && 'Funder'}
              {teamFilter === 'wdo' && 'WDO'}
              {teamFilter === 'water' && 'Water'}
              {teamFilter === 'inspection' && 'Inspection'}
              {teamFilter === 'handyman' && 'Handyman'}
            </span>
            <ChevronDown className="h-4 w-4 ml-2" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-[130px] bg-slate-800/95 backdrop-blur-xl border-purple-500/30">
          {categoryFilter === 'financials' && (
            <>
              <DropdownMenuItem
                onClick={() => setTeamFilter('select')}
                className="cursor-pointer text-purple-200 hover:!bg-gradient-to-r hover:!from-purple-600 hover:!to-pink-600 hover:!text-white focus:!bg-gradient-to-r focus:!from-purple-600 focus:!to-pink-600 focus:!text-white transition-all"
                data-testid="option-team-select"
              >
                Select
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setTeamFilter('pl')}
                className="cursor-pointer text-purple-200 hover:!bg-gradient-to-r hover:!from-purple-600 hover:!to-pink-600 hover:!text-white focus:!bg-gradient-to-r focus:!from-purple-600 focus:!to-pink-600 focus:!text-white transition-all"
                data-testid="option-team-pl"
              >
                P & L
              </DropdownMenuItem>
            </>
          )}
          {categoryFilter === 'direct-mail' && (
            <>
              <DropdownMenuItem
                onClick={() => setTeamFilter('va')}
                className="cursor-pointer text-purple-200 hover:!bg-gradient-to-r hover:!from-purple-600 hover:!to-pink-600 hover:!text-white focus:!bg-gradient-to-r focus:!from-purple-600 focus:!to-pink-600 focus:!text-white transition-all"
                data-testid="option-team-va"
              >
                VA
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setTeamFilter('va-jumbo')}
                className="cursor-pointer text-purple-200 hover:!bg-gradient-to-r hover:!from-purple-600 hover:!to-pink-600 hover:!text-white focus:!bg-gradient-to-r focus:!from-purple-600 focus:!to-pink-600 focus:!text-white transition-all"
                data-testid="option-team-va-jumbo"
              >
                VA Jumbo
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setTeamFilter('fnm')}
                className="cursor-pointer text-purple-200 hover:!bg-gradient-to-r hover:!from-purple-600 hover:!to-pink-600 hover:!text-white focus:!bg-gradient-to-r focus:!from-purple-600 focus:!to-pink-600 focus:!text-white transition-all"
                data-testid="option-team-fnm"
              >
                FNM
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setTeamFilter('fnm-jumbo')}
                className="cursor-pointer text-purple-200 hover:!bg-gradient-to-r hover:!from-purple-600 hover:!to-pink-600 hover:!text-white focus:!bg-gradient-to-r focus:!from-purple-600 focus:!to-pink-600 focus:!text-white transition-all"
                data-testid="option-team-fnm-jumbo"
              >
                FNM Jumbo
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setTeamFilter('fha')}
                className="cursor-pointer text-purple-200 hover:!bg-gradient-to-r hover:!from-purple-600 hover:!to-pink-600 hover:!text-white focus:!bg-gradient-to-r focus:!from-purple-600 focus:!to-pink-600 focus:!text-white transition-all"
                data-testid="option-team-fha"
              >
                FHA
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setTeamFilter('non-qm')}
                className="cursor-pointer text-purple-200 hover:!bg-gradient-to-r hover:!from-purple-600 hover:!to-pink-600 hover:!text-white focus:!bg-gradient-to-r focus:!from-purple-600 focus:!to-pink-600 focus:!text-white transition-all"
                data-testid="option-team-non-qm"
              >
                Non-QM
              </DropdownMenuItem>
            </>
          )}
          {categoryFilter === 'lead-vendor' && (
            <>
              <DropdownMenuItem
                onClick={() => setTeamFilter('select')}
                className="cursor-pointer text-purple-200 hover:!bg-gradient-to-r hover:!from-purple-600 hover:!to-pink-600 hover:!text-white focus:!bg-gradient-to-r focus:!from-purple-600 focus:!to-pink-600 focus:!text-white transition-all"
                data-testid="option-team-select"
              >
                Select
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setTeamFilter('tbd')}
                className="cursor-pointer text-purple-200 hover:!bg-gradient-to-r hover:!from-purple-600 hover:!to-pink-600 hover:!text-white focus:!bg-gradient-to-r focus:!from-purple-600 focus:!to-pink-600 focus:!text-white transition-all"
                data-testid="option-team-tbd"
              >
                TBD
              </DropdownMenuItem>
            </>
          )}
          {categoryFilter === 'social-media' && (
            <>
              <DropdownMenuItem
                onClick={() => setTeamFilter('facebook')}
                className="cursor-pointer text-purple-200 hover:!bg-gradient-to-r hover:!from-purple-600 hover:!to-pink-600 hover:!text-white focus:!bg-gradient-to-r focus:!from-purple-600 focus:!to-pink-600 focus:!text-white transition-all"
                data-testid="option-team-facebook"
              >
                Facebook
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setTeamFilter('x')}
                className="cursor-pointer text-purple-200 hover:!bg-gradient-to-r hover:!from-purple-600 hover:!to-pink-600 hover:!text-white focus:!bg-gradient-to-r focus:!from-purple-600 focus:!to-pink-600 focus:!text-white transition-all"
                data-testid="option-team-x"
              >
                X
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setTeamFilter('ig')}
                className="cursor-pointer text-purple-200 hover:!bg-gradient-to-r hover:!from-purple-600 hover:!to-pink-600 hover:!text-white focus:!bg-gradient-to-r focus:!from-purple-600 focus:!to-pink-600 focus:!text-white transition-all"
                data-testid="option-team-ig"
              >
                IG
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setTeamFilter('tiktok')}
                className="cursor-pointer text-purple-200 hover:!bg-gradient-to-r hover:!from-purple-600 hover:!to-pink-600 hover:!text-white focus:!bg-gradient-to-r focus:!from-purple-600 focus:!to-pink-600 focus:!text-white transition-all"
                data-testid="option-team-tiktok"
              >
                Tik Tok
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setTeamFilter('youtube')}
                className="cursor-pointer text-purple-200 hover:!bg-gradient-to-r hover:!from-purple-600 hover:!to-pink-600 hover:!text-white focus:!bg-gradient-to-r focus:!from-purple-600 focus:!to-pink-600 focus:!text-white transition-all"
                data-testid="option-team-youtube"
              >
                YouTube
              </DropdownMenuItem>
            </>
          )}
          {categoryFilter === 'staff' && (
            <>
              <DropdownMenuItem
                onClick={() => setTeamFilter('team')}
                className="cursor-pointer text-purple-200 hover:!bg-gradient-to-r hover:!from-purple-600 hover:!to-pink-600 hover:!text-white focus:!bg-gradient-to-r focus:!from-purple-600 focus:!to-pink-600 focus:!text-white transition-all"
                data-testid="option-team-team"
              >
                Team
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setTeamFilter('team-lead')}
                className="cursor-pointer text-purple-200 hover:!bg-gradient-to-r hover:!from-purple-600 hover:!to-pink-600 hover:!text-white focus:!bg-gradient-to-r focus:!from-purple-600 focus:!to-pink-600 focus:!text-white transition-all"
                data-testid="option-team-team-lead"
              >
                Team Lead
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setTeamFilter('mlo')}
                className="cursor-pointer text-purple-200 hover:!bg-gradient-to-r hover:!from-purple-600 hover:!to-pink-600 hover:!text-white focus:!bg-gradient-to-r focus:!from-purple-600 focus:!to-pink-600 focus:!text-white transition-all"
                data-testid="option-team-mlo"
              >
                MLO
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setTeamFilter('processor')}
                className="cursor-pointer text-purple-200 hover:!bg-gradient-to-r hover:!from-purple-600 hover:!to-pink-600 hover:!text-white focus:!bg-gradient-to-r focus:!from-purple-600 focus:!to-pink-600 focus:!text-white transition-all"
                data-testid="option-team-processor"
              >
                Processor
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setTeamFilter('uw')}
                className="cursor-pointer text-purple-200 hover:!bg-gradient-to-r hover:!from-purple-600 hover:!to-pink-600 hover:!text-white focus:!bg-gradient-to-r focus:!from-purple-600 focus:!to-pink-600 focus:!text-white transition-all"
                data-testid="option-team-uw"
              >
                UW
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setTeamFilter('funder')}
                className="cursor-pointer text-purple-200 hover:!bg-gradient-to-r hover:!from-purple-600 hover:!to-pink-600 hover:!text-white focus:!bg-gradient-to-r focus:!from-purple-600 focus:!to-pink-600 focus:!text-white transition-all"
                data-testid="option-team-funder"
              >
                Funder
              </DropdownMenuItem>
            </>
          )}
          {categoryFilter === 'vendor' && (
            <>
              <DropdownMenuItem
                onClick={() => setTeamFilter('select')}
                className="cursor-pointer text-purple-200 hover:!bg-gradient-to-r hover:!from-purple-600 hover:!to-pink-600 hover:!text-white focus:!bg-gradient-to-r focus:!from-purple-600 focus:!to-pink-600 focus:!text-white transition-all"
                data-testid="option-team-select"
              >
                Select
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setTeamFilter('wdo')}
                className="cursor-pointer text-purple-200 hover:!bg-gradient-to-r hover:!from-purple-600 hover:!to-pink-600 hover:!text-white focus:!bg-gradient-to-r focus:!from-purple-600 focus:!to-pink-600 focus:!text-white transition-all"
                data-testid="option-team-wdo"
              >
                WDO
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setTeamFilter('water')}
                className="cursor-pointer text-purple-200 hover:!bg-gradient-to-r hover:!from-purple-600 hover:!to-pink-600 hover:!text-white focus:!bg-gradient-to-r focus:!from-purple-600 focus:!to-pink-600 focus:!text-white transition-all"
                data-testid="option-team-water"
              >
                Water
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setTeamFilter('inspection')}
                className="cursor-pointer text-purple-200 hover:!bg-gradient-to-r hover:!from-purple-600 hover:!to-pink-600 hover:!text-white focus:!bg-gradient-to-r focus:!from-purple-600 focus:!to-pink-600 focus:!text-white transition-all"
                data-testid="option-team-inspection"
              >
                Inspection
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setTeamFilter('handyman')}
                className="cursor-pointer text-purple-200 hover:!bg-gradient-to-r hover:!from-purple-600 hover:!to-pink-600 hover:!text-white focus:!bg-gradient-to-r focus:!from-purple-600 focus:!to-pink-600 focus:!text-white transition-all"
                data-testid="option-team-handyman"
              >
                Handyman
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Time Filter Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className="flex items-center gap-2 px-4 py-2 bg-purple-500/20 hover:bg-purple-500/40 rounded-lg border border-purple-500/30 hover:border-purple-500/50 transition-all text-sm"
            data-testid="button-time-filter"
          >
            <span className="text-purple-200">
              {timeFilter === 'today' && new Date().toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })}
              {timeFilter === 'mtd' && 'MTD'}
              {timeFilter === 'ytd' && 'YTD'}
              {timeFilter === 'fromDate' && 'From Date'}
              {timeFilter === 'toDate' && 'To Date'}
              {timeFilter === 'compare' && 'Compare'}
            </span>
            <ChevronDown className="h-4 w-4 text-purple-300" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48 bg-slate-800/95 backdrop-blur-xl border-purple-500/30">
          <DropdownMenuItem
            onClick={() => setTimeFilter('today')}
            className="cursor-pointer text-purple-200 hover:!bg-gradient-to-r hover:!from-purple-600 hover:!to-pink-600 hover:!text-white focus:!bg-gradient-to-r focus:!from-purple-600 focus:!to-pink-600 focus:!text-white transition-all"
            data-testid="option-today"
          >
            Today ({new Date().toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })})
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => setTimeFilter('mtd')}
            className="cursor-pointer text-purple-200 hover:!bg-gradient-to-r hover:!from-purple-600 hover:!to-pink-600 hover:!text-white focus:!bg-gradient-to-r focus:!from-purple-600 focus:!to-pink-600 focus:!text-white transition-all"
            data-testid="option-mtd"
          >
            MTD
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => setTimeFilter('ytd')}
            className="cursor-pointer text-purple-200 hover:!bg-gradient-to-r hover:!from-purple-600 hover:!to-pink-600 hover:!text-white focus:!bg-gradient-to-r focus:!from-purple-600 focus:!to-pink-600 focus:!text-white transition-all"
            data-testid="option-ytd"
          >
            YTD
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => setTimeFilter('fromDate')}
            className="cursor-pointer text-purple-200 hover:!bg-gradient-to-r hover:!from-purple-600 hover:!to-pink-600 hover:!text-white focus:!bg-gradient-to-r focus:!from-purple-600 focus:!to-pink-600 focus:!text-white transition-all"
            data-testid="option-from-date"
          >
            From Date
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => setTimeFilter('toDate')}
            className="cursor-pointer text-purple-200 hover:!bg-gradient-to-r hover:!from-purple-600 hover:!to-pink-600 hover:!text-white focus:!bg-gradient-to-r focus:!from-purple-600 focus:!to-pink-600 focus:!text-white transition-all"
            data-testid="option-to-date"
          >
            To Date
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => setTimeFilter('compare')}
            className="cursor-pointer text-purple-200 hover:!bg-gradient-to-r hover:!from-purple-600 hover:!to-pink-600 hover:!text-white focus:!bg-gradient-to-r focus:!from-purple-600 focus:!to-pink-600 focus:!text-white transition-all"
            data-testid="option-compare"
          >
            Compare
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Date input fields for From Date and To Date */}
      {timeFilter === 'fromDate' && (
        <input
          type="text"
          placeholder="MM/DD/YYYY"
          value={timeFilterFromDate}
          onChange={(e) => handleTimeFilterDateInput(e, 'from')}
          className="bg-slate-700/50 text-white px-3 py-1 rounded-lg border border-purple-500/30 focus:outline-none focus:border-purple-500 transition-colors text-sm w-32"
          data-testid="input-time-filter-from-date"
          maxLength={10}
        />
      )}
      
      {timeFilter === 'toDate' && (
        <input
          type="text"
          placeholder="MM/DD/YYYY"
          value={timeFilterToDate}
          onChange={(e) => handleTimeFilterDateInput(e, 'to')}
          className="bg-slate-700/50 text-white px-3 py-1 rounded-lg border border-purple-500/30 focus:outline-none focus:border-purple-500 transition-colors text-sm w-32"
          data-testid="input-time-filter-to-date"
          maxLength={10}
        />
      )}
    </div>
  );
}
