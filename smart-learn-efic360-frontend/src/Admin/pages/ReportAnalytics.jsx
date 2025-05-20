// ReportAnalytics.jsx
import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, Legend } from 'recharts';
import axios from 'axios';


const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const ReportAnalytics = ({ isAdmin }) => {
  const [data, setData] = useState([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [grade, setGrade] = useState('');
  const [teacher, setTeacher] = useState('');
  const [subject, setSubject] = useState('');

  useEffect(() => {
    fetchReport();
  }, [startDate, endDate, grade, teacher, subject]);

  const fetchReport = async () => {
    try {
      const res = await axios.get('/api/reports', {
        params: { start: startDate, end: endDate, grade, teacher, subject }
      });
      setData(res.data);
    } catch (err) {
      console.error('Error fetching report:', err);
    }
  };

  const exportReport = (format) => {
    window.open(`/api/reports/export?format=${format}&start=${startDate}&end=${endDate}&grade=${grade}`);
  };

  if (!isAdmin) return <p>🔒 Access restricted to admins only.</p>;

  return (
    <div className="report-analytics">
      <h2>📊 Reports & Analytics</h2>

      <div className="filters">
        <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        <input placeholder="Grade" value={grade} onChange={(e) => setGrade(e.target.value)} />
        <input placeholder="Teacher" value={teacher} onChange={(e) => setTeacher(e.target.value)} />
        <input placeholder="Subject" value={subject} onChange={(e) => setSubject(e.target.value)} />
      </div>

      <div className="export-buttons">
        <button onClick={() => exportReport('pdf')}>📄 Export PDF</button>
        <button onClick={() => exportReport('excel')}>📊 Export Excel</button>
        <button onClick={() => exportReport('csv')}>📋 Export CSV</button>
      </div>

      <div className="charts">
        <BarChart width={600} height={300} data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <XAxis dataKey="label" stroke="#333" />
          <YAxis stroke="#333" />
          <Tooltip />
          <Legend />
          <Bar dataKey="value" fill="#8884d8" barSize={30} radius={[5, 5, 0, 0]} />
        </BarChart>

        <PieChart width={400} height={300}>
          <Pie data={data} dataKey="value" nameKey="label" cx="50%" cy="50%" outerRadius={100} label>
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend layout="vertical" verticalAlign="middle" align="right" />
        </PieChart>
      </div>
    </div>
  );
};

export default ReportAnalytics;
