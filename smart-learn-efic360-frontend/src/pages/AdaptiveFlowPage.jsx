// src/pages/AdaptiveFlowPage.jsx
import React, { useEffect, useState } from 'react';
import adaptiveFlowService from '../services/adaptiveFlowService';
import '../styles/AdaptiveFlowPage.scss';

export default function AdaptiveFlowPage() {
  const [currentStep, setCurrentStep] = useState(null);
  const [flowData, setFlowData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchFlow() {
      try {
        const data = await adaptiveFlowService.getCurrentFlow();
        setFlowData(data.steps);
        setCurrentStep(data.currentStep);
      } catch (err) {
        setError('Failed to load adaptive flow.');
      } finally {
        setLoading(false);
      }
    }
    fetchFlow();
  }, []);

  const handleNext = async () => {
    if (!currentStep) return;
    setLoading(true);
    try {
      const data = await adaptiveFlowService.advanceStep(currentStep.id);
      setCurrentStep(data.currentStep);
      setFlowData(data.steps);
    } catch (err) {
      setError('Failed to advance to next step.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <p>Loading adaptive flow...</p>;
  if (error) return <p className="error">{error}</p>;
  if (!currentStep) return <p>No active learning flow.</p>;

  return (
    <div className="adaptive-flow-page">
      <h1>Adaptive Learning Flow</h1>

      <div className="flow-step">
        <h2>Current Step</h2>
        <p>{currentStep.title}</p>
        <p>{currentStep.description}</p>
      </div>

      <button onClick={handleNext} disabled={loading}>
        Next Step
      </button>

      <section className="flow-overview">
        <h3>All Steps</h3>
        <ul>
          {flowData.map((step) => (
            <li key={step.id} className={step.id === currentStep.id ? 'active' : ''}>
              {step.title}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
