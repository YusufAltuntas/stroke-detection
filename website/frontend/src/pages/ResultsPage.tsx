import { useEffect, useState } from "react";
import { Activity, AlertCircle, ArrowRight, Database, Trophy } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { getResults, type ResultsResponse } from "../api/client";

function MetricCards({ title, metrics }: { title: string; metrics: ResultsResponse["stage1Metrics"] }) {
  return (
    <section className="panel">
      <div className="section-title">
        <div>
          <span className="eyebrow">Final model</span>
          <h3>{title}</h3>
        </div>
        <Trophy size={22} />
      </div>
      <div className="metric-grid">
        {metrics.map((metric) => (
          <div className="metric-card" key={metric.label}>
            <span>{metric.label}</span>
            <strong>{metric.value}</strong>
            {metric.note && <small>{metric.note}</small>}
          </div>
        ))}
      </div>
    </section>
  );
}

function DatasetSummary({ data, title }: { data: ResultsResponse["stage1Distribution"]; title: string }) {
  return (
    <section className="panel">
      <div className="section-title">
        <div>
          <span className="eyebrow">Dataset</span>
          <h3>{title}</h3>
        </div>
        <Database size={22} />
      </div>
      <div className="chart-box">
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="label" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value" radius={[8, 8, 0, 0]}>
              {data.map((entry) => <Cell key={entry.label} fill={entry.color} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}

export function ResultsPage() {
  const [data, setData] = useState<ResultsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getResults().then(setData).catch((exc: Error) => setError(exc.message));
  }, []);

  if (error) {
    return <div className="validation-alert"><AlertCircle size={18} /> {error}</div>;
  }

  if (!data) {
    return <div className="panel">Sonuc verileri yukleniyor.</div>;
  }

  return (
    <div className="page-stack">
      <section className="hero-panel results-hero">
        <div>
          <span className="eyebrow">Experiment narrative</span>
          <h1>Deneyler & Sonuclar</h1>
          <p>Model aileleri, veri dengesizligi ve nihai iki asamali sistemin secim gerekcesi.</p>
        </div>
      </section>

      <section className="pipeline-strip">
        <div><Activity size={20} /> MRI-DWI Image</div>
        <ArrowRight size={20} />
        <div>Stage 1: Stroke Detection</div>
        <ArrowRight size={20} />
        <div>Stage 2: ACA / MCA / PCA</div>
      </section>

      <div className="dashboard-grid">
        <DatasetSummary title="Stage 1 Distribution" data={data.stage1Distribution} />
        <DatasetSummary title="Stage 2 Distribution" data={data.stage2Distribution} />
      </div>

      <div className="dashboard-grid">
        <MetricCards title="EfficientNet-B3 Binary" metrics={data.stage1Metrics} />
        <MetricCards title="DenseNet-121 Artery" metrics={data.stage2Metrics} />
      </div>

      <section className="panel">
        <div className="section-title">
          <div>
            <span className="eyebrow">Model families</span>
            <h3>Deney Karsilastirmasi</h3>
          </div>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Family</th>
                <th>Version</th>
                <th>Macro F1</th>
                <th>ACA F1</th>
                <th>MCA F1</th>
                <th>PCA F1</th>
                <th>Strategy</th>
              </tr>
            </thead>
            <tbody>
              {data.experiments.map((row) => (
                <tr key={`${row.family}-${row.version}`} className={row.selected ? "selected-row" : ""}>
                  <td>{row.family}</td>
                  <td>{row.version}</td>
                  <td>{row.macroF1.toFixed(4)}</td>
                  <td>{row.acaF1?.toFixed(4) ?? "-"}</td>
                  <td>{row.mcaF1?.toFixed(4) ?? "-"}</td>
                  <td>{row.pcaF1?.toFixed(4) ?? "-"}</td>
                  <td>{row.strategy}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="panel">
        <div className="section-title">
          <div>
            <span className="eyebrow">Per-class report</span>
            <h3>DenseNet-121 v1 Precision / Recall / F1</h3>
          </div>
        </div>
        <div className="chart-box wide">
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={data.stage2PerClass}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="className" />
              <YAxis domain={[0, 1]} />
              <Tooltip />
              <Legend />
              <Bar dataKey="precision" fill="#38bdf8" radius={[6, 6, 0, 0]} />
              <Bar dataKey="recall" fill="#2563eb" radius={[6, 6, 0, 0]} />
              <Bar dataKey="f1" fill="#0f766e" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="panel limitations">
        <div className="section-title">
          <div>
            <span className="eyebrow">Research frame</span>
            <h3>Limitations</h3>
          </div>
          <AlertCircle size={22} />
        </div>
        <ul>
          {data.limitations.map((item) => <li key={item}>{item}</li>)}
        </ul>
      </section>
    </div>
  );
}
