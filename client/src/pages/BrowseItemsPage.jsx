import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Search,
  Filter,
  X,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  RefreshCw,
} from 'lucide-react';
import api from '../services/api';
import ItemCard from '../components/common/ItemCard';
import LoadingSkeleton from '../components/common/LoadingSkeleton';
import EmptyState from '../components/common/EmptyState';
import { DEFAULT_CATEGORIES, DEFAULT_LOCATIONS } from '../constants/defaults';

const BrowseItemsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Filters state from URL query or defaults
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [reportType, setReportType] = useState(searchParams.get('reportType') || 'All');
  const [category, setCategory] = useState(searchParams.get('category') || 'All');
  const [location, setLocation] = useState(searchParams.get('location') || 'All');
  const [status, setStatus] = useState(searchParams.get('status') || 'All');
  const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || 'newest');
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('page'), 10) || 1);

  // Data states
  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState({ totalPages: 1, totalCount: 0 });
  const [categoriesList, setCategoriesList] = useState(DEFAULT_CATEGORIES);
  const [locationsList, setLocationsList] = useState(DEFAULT_LOCATIONS);
  const [loading, setLoading] = useState(true);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Load categories and locations dropdowns once
  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const [catRes, locRes] = await Promise.all([
          api.get('/categories'),
          api.get('/locations'),
        ]);
        if (catRes.data?.success && catRes.data.categories?.length > 0) {
          setCategoriesList(catRes.data.categories);
        }
        if (locRes.data?.success && locRes.data.locations?.length > 0) {
          setLocationsList(locRes.data.locations);
        }
      } catch (err) {
        console.error('Failed to load filter metadata:', err);
      }
    };
    fetchMetadata();
  }, []);

  // Fetch items whenever filters change
  const fetchItems = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search.trim()) params.set('search', search.trim());
      if (reportType !== 'All') params.set('reportType', reportType);
      if (category !== 'All') params.set('category', category);
      if (location !== 'All') params.set('location', location);
      if (status !== 'All') params.set('status', status);
      if (sortBy) params.set('sortBy', sortBy);
      params.set('page', currentPage);
      params.set('limit', 12);

      // Keep URL search params in sync
      setSearchParams(params);

      const res = await api.get(`/items?${params.toString()}`);
      if (res.data.success) {
        setItems(res.data.items);
        setPagination(res.data.pagination);
      }
    } catch (err) {
      console.error('Failed to fetch items:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [reportType, category, location, status, sortBy, currentPage]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchItems();
  };

  const handleClearFilters = () => {
    setSearch('');
    setReportType('All');
    setCategory('All');
    setLocation('All');
    setStatus('All');
    setSortBy('newest');
    setCurrentPage(1);
    setSearchParams({});
  };

  const activeFiltersCount = [
    search ? 1 : 0,
    reportType !== 'All' ? 1 : 0,
    category !== 'All' ? 1 : 0,
    location !== 'All' ? 1 : 0,
    status !== 'All' ? 1 : 0,
  ].reduce((a, b) => a + b, 0);

  return (
    <div className="container" style={{ padding: '2.5rem 1.25rem 4rem 1.25rem' }}>
      {/* Page Title & Search Bar */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.35rem' }}>
          Browse Lost & Found Belongings
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>
          Explore all active campus reports, filter by zone or category, and search keywords.
        </p>

        {/* Search Input Bar */}
        <form
          onSubmit={handleSearchSubmit}
          style={{
            display: 'flex',
            gap: '0.75rem',
            marginTop: '1.25rem',
            maxWidth: '680px',
          }}
        >
          <div style={{ position: 'relative', flex: 1 }}>
            <Search
              size={18}
              color="var(--text-muted)"
              style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)' }}
            />
            <input
              type="text"
              className="form-input"
              style={{ paddingLeft: '2.5rem' }}
              placeholder="Search by title, description, or campus building..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button type="submit" className="btn btn-primary">
            Search
          </button>
        </form>
      </div>

      {/* Main Layout: Sidebar Filters + Item Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '2rem' }} className="browse-layout">
        {/* Left Filter Sidebar */}
        <aside
          className="card filter-sidebar"
          style={{
            alignSelf: 'start',
            padding: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '1rem' }}>
              <Filter size={18} />
              <span>Filter Items</span>
              {activeFiltersCount > 0 && (
                <span className="badge badge-open" style={{ fontSize: '0.7rem' }}>
                  {activeFiltersCount}
                </span>
              )}
            </div>

            {activeFiltersCount > 0 && (
              <button
                onClick={handleClearFilters}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--accent)',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Reset All
              </button>
            )}
          </div>

          {/* Report Type Filter (Tabs) */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Report Type</label>
            <div style={{ display: 'flex', gap: '0.35rem', backgroundColor: 'var(--bg-tertiary)', padding: '4px', borderRadius: 'var(--radius-md)' }}>
              {['All', 'lost', 'found'].map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => {
                    setReportType(t);
                    setCurrentPage(1);
                  }}
                  style={{
                    flex: 1,
                    padding: '0.375rem',
                    fontSize: '0.8125rem',
                    fontWeight: reportType === t ? 700 : 500,
                    borderRadius: 'var(--radius-sm)',
                    border: 'none',
                    backgroundColor: reportType === t ? 'var(--bg-card)' : 'transparent',
                    color: reportType === t ? 'var(--accent)' : 'var(--text-secondary)',
                    boxShadow: reportType === t ? 'var(--shadow-sm)' : 'none',
                    cursor: 'pointer',
                    textTransform: 'capitalize',
                  }}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Category Filter */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Category</label>
            <select
              className="form-select"
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="All">All Categories</option>
              {(categoriesList && categoriesList.length > 0 ? categoriesList : DEFAULT_CATEGORIES).map((c) => (
                <option key={c._id || c.name} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Location Filter */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Campus Location</label>
            <select
              className="form-select"
              value={location}
              onChange={(e) => {
                setLocation(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="All">All Campus Locations</option>
              {(locationsList && locationsList.length > 0 ? locationsList : DEFAULT_LOCATIONS).map((loc) => (
                <option key={loc._id || loc.name} value={loc.name}>
                  {loc.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Item Status</label>
            <select
              className="form-select"
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="All">All Statuses</option>
              <option value="open">Open / Unclaimed</option>
              <option value="claimed">Claimed</option>
              <option value="recovered">Recovered & Handed Over</option>
            </select>
          </div>

          {/* Sort By */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Sort Order</label>
            <select
              className="form-select"
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="eventDate">Date of Incident</option>
            </select>
          </div>
        </aside>

        {/* Right Content: Grid & Pagination */}
        <div>
          {/* Header Bar */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '1.25rem',
            }}
          >
            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              Showing{' '}
              <strong style={{ color: 'var(--text-primary)' }}>
                {pagination.totalCount}
              </strong>{' '}
              item reports
            </div>

            {/* Mobile Filter Toggle Button */}
            <button
              onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
              className="btn btn-secondary btn-sm mobile-filter-btn"
              style={{ display: 'none' }}
            >
              <SlidersHorizontal size={14} />
              <span>Filters ({activeFiltersCount})</span>
            </button>
          </div>

          {/* Items Display */}
          {loading ? (
            <LoadingSkeleton count={6} />
          ) : items.length > 0 ? (
            <>
              <div className="grid-cards">
                {items.map((item) => (
                  <ItemCard key={item._id} item={item} />
                ))}
              </div>

              {/* Pagination Controls */}
              {pagination.totalPages > 1 && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    marginTop: '3rem',
                  }}
                >
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={!pagination.hasPrevPage}
                    className="btn btn-secondary btn-sm"
                  >
                    <ChevronLeft size={16} />
                    <span>Previous</span>
                  </button>

                  <div style={{ display: 'flex', gap: '0.25rem' }}>
                    {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((pg) => (
                      <button
                        key={pg}
                        onClick={() => setCurrentPage(pg)}
                        className={`btn btn-sm ${currentPage === pg ? 'btn-primary' : 'btn-secondary'}`}
                        style={{ minWidth: '36px' }}
                      >
                        {pg}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => setCurrentPage((p) => Math.min(pagination.totalPages, p + 1))}
                    disabled={!pagination.hasNextPage}
                    className="btn btn-secondary btn-sm"
                  >
                    <span>Next</span>
                    <ChevronRight size={16} />
                  </button>
                </div>
              )}
            </>
          ) : (
            <EmptyState
              title="No Matching Reports Found"
              description="Try adjusting your filters, searching with different keywords, or check back later."
              secondaryActionText="Clear All Filters"
              onSecondaryAction={handleClearFilters}
              actionText="Report an Item"
              actionLink="/report-lost"
            />
          )}
        </div>
      </div>

      <style>{`
        @media (max-width: 860px) {
          .browse-layout {
            grid-template-columns: 1fr !important;
          }
          .filter-sidebar {
            display: ${mobileFilterOpen ? 'flex' : 'none'} !important;
          }
          .mobile-filter-btn {
            display: inline-flex !important;
          }
        }
      `}</style>
    </div>
  );
};

export default BrowseItemsPage;
