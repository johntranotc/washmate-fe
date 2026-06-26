import { useState, useEffect, useMemo } from "react";
import {
  Sparkles,
  RefreshCw,
  AlertTriangle,
  TrendingUp,
  Users,
  Award,
  Filter,
  CheckCircle2,
  XCircle,
  AlertCircle
} from "lucide-react";
import { getAdminAiInsights, generateAdminAiInsights } from "../../api/aiInsightsApi";

function groupInsightsByCustomer(insights) {
  const grouped = {};
  if (!Array.isArray(insights)) return [];

  insights.forEach((insight) => {
    const { userId } = insight;
    if (!grouped[userId]) {
      grouped[userId] = {
        userId,
        customerName: insight.customerName,
        garageName: insight.garageName,
        segmentInsight: null,
        churnInsight: null,
        promotionInsight: null,
        serviceInsight: null,
        metrics: null,
        allInsights: [],
      };
    }
    
    grouped[userId].allInsights.push(insight);

    switch (insight.insightType) {
      case "CUSTOMER_SEGMENT":
        grouped[userId].segmentInsight = insight;
        if (insight.predictionValue?.metrics) {
            grouped[userId].metrics = insight.predictionValue.metrics;
        }
        break;
      case "CHURN_RISK":
        grouped[userId].churnInsight = insight;
        break;
      case "PROMOTION_RECOMMENDATION":
        grouped[userId].promotionInsight = insight;
        break;
      case "SERVICE_RECOMMENDATION":
        grouped[userId].serviceInsight = insight;
        break;
      default:
        break;
    }
    
    // Fallback metrics
    if (!grouped[userId].metrics && insight.predictionValue?.metrics) {
        grouped[userId].metrics = insight.predictionValue.metrics;
    }
  });

  return Object.values(grouped);
}

const formatCurrency = (amount) => {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount || 0);
};

const formatPercent = (val) => {
  return Math.round(Number(val || 0) * 100) + "%";
};

export default function AiInsightsPage() {
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState(null);

  // Defaults
  const currentYearMonth = new Date().toISOString().slice(0, 7);
  const [period, setPeriod] = useState(currentYearMonth);
  const [garageId, setGarageId] = useState(1);

  const fetchInsights = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAdminAiInsights({ garageId, period });
      setInsights(data || []);
    } catch (err) {
      setError(err?.message || "Failed to fetch insights");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    setGenerating(true);
    setError(null);
    try {
      await generateAdminAiInsights({ garageId, period });
      await fetchInsights();
    } catch (err) {
      setError(err?.message || "Failed to generate insights");
    } finally {
      setGenerating(false);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, [garageId, period]);

  const groupedCustomers = useMemo(() => groupInsightsByCustomer(insights), [insights]);

  // KPIs
  const totalCustomers = groupedCustomers.length;
  let vipCount = 0;
  let loyalCount = 0;
  let newCount = 0;
  let atRiskCount = 0;
  let regularCount = 0;
  let totalConfidence = 0;
  let insightCount = 0;

  const atRiskList = [];

  groupedCustomers.forEach((c) => {
    const segmentLabel = c.segmentInsight?.predictionValue?.label;
    const churnLabel = c.churnInsight?.predictionValue?.label;
    
    // Count segments
    if (segmentLabel === "VIP") vipCount++;
    else if (segmentLabel === "LOYAL") loyalCount++;
    else if (segmentLabel === "NEW") newCount++;
    else if (segmentLabel === "AT_RISK") atRiskCount++;
    else if (segmentLabel === "REGULAR") regularCount++;
    else regularCount++; // Fallback

    if (segmentLabel === "AT_RISK" || churnLabel === "HIGH") {
      if (segmentLabel !== "AT_RISK") atRiskCount++; // If it wasn't counted above
      atRiskList.push(c);
    }

    c.allInsights.forEach(i => {
      totalConfidence += (i.confidenceScore || 0);
      insightCount++;
    });
  });

  const avgConfidence = insightCount > 0 ? (totalConfidence / insightCount) : 0;
  const topAtRisk = atRiskList.slice(0, 3);

  const getSegmentColor = (segment) => {
    switch (segment) {
      case "VIP": return "bg-amber-100 text-amber-800 border-amber-200";
      case "LOYAL": return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "NEW": return "bg-sky-100 text-sky-800 border-sky-200";
      case "AT_RISK": return "bg-rose-100 text-rose-800 border-rose-200";
      default: return "bg-slate-100 text-slate-800 border-slate-200"; // REGULAR
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">AI Customer Insights</h1>
            <span className="inline-flex items-center rounded-md bg-violet-100 px-2 py-1 text-xs font-medium text-violet-700 border border-violet-200">
              rule-v1
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-500">Rule-based intelligence for customer retention and service growth</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center rounded-md border border-slate-200 bg-white p-1 shadow-sm">
            <div className="flex items-center px-2 border-r border-slate-100">
              <Filter size={14} className="text-slate-400 mr-2" />
              <span className="text-xs font-medium text-slate-500">Garage</span>
            </div>
            <input
              type="number"
              value={garageId}
              onChange={(e) => setGarageId(Number(e.target.value))}
              className="w-16 border-0 bg-transparent px-2 py-1.5 text-sm font-semibold text-slate-700 focus:ring-0 outline-none"
              min="1"
            />
          </div>
          <div className="flex items-center rounded-md border border-slate-200 bg-white p-1 shadow-sm">
            <input
              type="month"
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="border-0 bg-transparent px-2 py-1.5 text-sm font-semibold text-slate-700 focus:ring-0 outline-none"
            />
          </div>
          <button
            onClick={handleGenerate}
            disabled={loading || generating}
            className="inline-flex items-center gap-2 rounded-md bg-slate-900 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {generating ? <RefreshCw className="animate-spin" size={16} /> : <Sparkles size={16} />}
            <span className="whitespace-nowrap">Generate Insights</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-4 border border-red-200 flex items-start gap-3">
          <AlertCircle className="text-red-600 mt-0.5" size={18} />
          <div className="flex-1">
            <h3 className="text-sm font-medium text-red-800">Error loading insights</h3>
            <p className="text-sm text-red-700 mt-1">{error}</p>
          </div>
          <button onClick={fetchInsights} className="text-sm font-medium text-red-700 hover:text-red-800 underline">
            Retry
          </button>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-md border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-500">Total Customers</p>
            <Users size={18} className="text-slate-400" />
          </div>
          <p className="mt-2 text-3xl font-bold text-slate-900">{loading ? "-" : totalCustomers}</p>
        </div>
        <div className="rounded-md border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-500">At-Risk Customers</p>
            <AlertTriangle size={18} className="text-rose-500" />
          </div>
          <p className="mt-2 text-3xl font-bold text-slate-900">{loading ? "-" : atRiskCount}</p>
        </div>
        <div className="rounded-md border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-500">VIP Customers</p>
            <Award size={18} className="text-amber-500" />
          </div>
          <p className="mt-2 text-3xl font-bold text-slate-900">{loading ? "-" : vipCount}</p>
        </div>
        <div className="rounded-md border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-500">Avg Confidence</p>
            <TrendingUp size={18} className="text-emerald-500" />
          </div>
          <p className="mt-2 text-3xl font-bold text-slate-900">{loading ? "-" : formatPercent(avgConfidence)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Recommendation Panel */}
        <div className="lg:col-span-1 space-y-6">
          <div className="rounded-md border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="border-b border-slate-100 bg-slate-50 px-5 py-4">
              <h3 className="text-base font-semibold text-slate-800 flex items-center gap-2">
                <AlertTriangle size={18} className="text-rose-500" />
                Priority Actions
              </h3>
              <p className="text-xs text-slate-500 mt-1">Top customers requiring attention</p>
            </div>
            <div className="divide-y divide-slate-100">
              {loading ? (
                <div className="p-8 text-center text-sm text-slate-500">Loading...</div>
              ) : topAtRisk.length === 0 ? (
                <div className="p-8 text-center text-sm text-slate-500">No at-risk customers identified.</div>
              ) : (
                topAtRisk.map((c) => {
                  const riskInsight = c.churnInsight?.predictionValue?.label === "HIGH" ? c.churnInsight : c.segmentInsight;
                  return (
                    <div key={c.userId} className="p-5">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-slate-900 text-sm truncate pr-2">{c.customerName}</span>
                        <span className="inline-flex shrink-0 rounded-md bg-rose-100 px-2 py-0.5 text-[10px] font-semibold text-rose-700 border border-rose-200">
                          {riskInsight?.predictionValue?.label || "AT_RISK"}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mb-3 bg-slate-50 p-2 rounded border border-slate-100 line-clamp-2">
                        {riskInsight?.predictionValue?.reason || "High risk of churn detected."}
                      </p>
                      <div className="text-xs font-medium text-slate-700 flex items-start gap-1.5">
                        <CheckCircle2 size={14} className="text-emerald-500 shrink-0 mt-0.5" />
                        <span className="line-clamp-2">{riskInsight?.predictionValue?.recommendedAction || "Reach out to the customer."}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Segment Overview */}
          <div className="rounded-md border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="border-b border-slate-100 bg-slate-50 px-5 py-4">
              <h3 className="text-base font-semibold text-slate-800">Segment Overview</h3>
            </div>
            <div className="p-5 space-y-4">
              {[
                { label: "VIP", count: vipCount, color: "bg-amber-500", text: "text-amber-700", bg: "bg-amber-50" },
                { label: "LOYAL", count: loyalCount, color: "bg-emerald-500", text: "text-emerald-700", bg: "bg-emerald-50" },
                { label: "NEW", count: newCount, color: "bg-sky-500", text: "text-sky-700", bg: "bg-sky-50" },
                { label: "REGULAR", count: regularCount, color: "bg-slate-400", text: "text-slate-700", bg: "bg-slate-50" },
                { label: "AT_RISK", count: atRiskCount, color: "bg-rose-500", text: "text-rose-700", bg: "bg-rose-50" },
              ].map((seg) => {
                const total = totalCustomers || 1;
                const percent = Math.round((seg.count / total) * 100);
                return (
                  <div key={seg.label}>
                    <div className="flex justify-between text-xs font-medium mb-1.5">
                      <span className={`${seg.text} px-2 py-0.5 rounded-md ${seg.bg}`}>{seg.label}</span>
                      <span className="text-slate-600">{seg.count} ({percent}%)</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1.5">
                      <div className={`${seg.color} h-1.5 rounded-full`} style={{ width: `${percent}%` }}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Main Table */}
        <div className="lg:col-span-2 rounded-md border border-slate-200 bg-white shadow-sm overflow-hidden flex flex-col">
          <div className="border-b border-slate-100 bg-slate-50 px-5 py-4">
            <h3 className="text-base font-semibold text-slate-800">Detailed Customer Insights</h3>
          </div>
          
          <div className="flex-1 overflow-x-auto">
            {loading && insights.length === 0 ? (
              <div className="p-12 text-center">
                <RefreshCw className="animate-spin text-slate-400 mx-auto mb-3" size={24} />
                <p className="text-sm text-slate-500">Loading insights...</p>
              </div>
            ) : groupedCustomers.length === 0 ? (
              <div className="p-16 text-center">
                <div className="mx-auto w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mb-3 border border-slate-100">
                  <Sparkles className="text-slate-400" size={24} />
                </div>
                <h3 className="text-sm font-semibold text-slate-900 mb-1">No insights yet</h3>
                <p className="text-sm text-slate-500 mb-4">Generate insights for this period to see data.</p>
                <button
                  onClick={handleGenerate}
                  disabled={generating}
                  className="inline-flex items-center gap-2 rounded-md bg-white border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 transition-colors"
                >
                  {generating ? <RefreshCw className="animate-spin" size={14} /> : <Sparkles size={14} />}
                  Generate Now
                </button>
              </div>
            ) : (
              <table className="w-full min-w-[700px] text-left text-sm text-slate-600">
                <thead className="bg-slate-50/50 text-xs uppercase text-slate-500 border-b border-slate-100">
                  <tr>
                    <th className="px-5 py-3 font-semibold">Customer</th>
                    <th className="px-5 py-3 font-semibold">Segment</th>
                    <th className="px-5 py-3 font-semibold">Risk</th>
                    <th className="px-5 py-3 font-semibold text-right">Metrics</th>
                    <th className="px-5 py-3 font-semibold w-[25%]">Recommendation</th>
                    <th className="px-5 py-3 font-semibold text-right">Conf.</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {groupedCustomers.map((c) => {
                    const segmentLabel = c.segmentInsight?.predictionValue?.label || "REGULAR";
                    const riskLabel = c.churnInsight?.predictionValue?.label || "-";
                    const recAction = c.promotionInsight?.predictionValue?.recommendedAction || 
                                      c.segmentInsight?.predictionValue?.recommendedAction || 
                                      "-";
                    const metrics = c.metrics || {};
                    
                    let cConf = 0;
                    c.allInsights.forEach(i => cConf += (i.confidenceScore || 0));
                    const avgCConf = c.allInsights.length > 0 ? (cConf / c.allInsights.length) : 0;

                    return (
                      <tr key={c.userId} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-5 py-3 whitespace-nowrap">
                          <div className="font-semibold text-slate-900">{c.customerName}</div>
                          <div className="text-xs text-slate-500">ID: {c.userId}</div>
                        </td>
                        <td className="px-5 py-3 whitespace-nowrap">
                          <span className={`inline-flex items-center rounded-md px-2 py-1 text-[10px] font-semibold border ${getSegmentColor(segmentLabel)}`}>
                            {segmentLabel}
                          </span>
                        </td>
                        <td className="px-5 py-3 whitespace-nowrap">
                          {riskLabel === "HIGH" ? (
                            <span className="text-rose-600 font-semibold text-[10px] flex items-center gap-1">
                              <AlertTriangle size={12} /> HIGH
                            </span>
                          ) : riskLabel === "MEDIUM" ? (
                            <span className="text-amber-600 font-semibold text-[10px]">MEDIUM</span>
                          ) : riskLabel === "LOW" ? (
                            <span className="text-emerald-600 font-semibold text-[10px]">LOW</span>
                          ) : (
                            <span className="text-slate-400 text-xs">-</span>
                          )}
                        </td>
                        <td className="px-5 py-3 whitespace-nowrap text-right">
                          <div className="text-slate-900 font-medium text-xs">{formatCurrency(metrics.totalSpent)}</div>
                          <div className="text-[10px] text-slate-500 mt-1 flex items-center justify-end gap-2">
                            <span title="Completed" className="flex items-center gap-0.5"><CheckCircle2 size={10} className="text-emerald-500"/> {metrics.completedCount || 0}</span>
                            <span title="Cancel/No-show" className="flex items-center gap-0.5"><XCircle size={10} className="text-rose-500"/> {(metrics.cancelledCount || 0) + (metrics.noShowCount || 0)}</span>
                            <span title="Total Bookings" className="text-slate-400">/ {metrics.totalBookings || 0}</span>
                          </div>
                        </td>
                        <td className="px-5 py-3">
                          <div className="text-[11px] text-slate-700 line-clamp-2" title={recAction}>
                            {recAction}
                          </div>
                        </td>
                        <td className="px-5 py-3 whitespace-nowrap text-right text-xs font-medium text-slate-500">
                          {formatPercent(avgCConf)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
