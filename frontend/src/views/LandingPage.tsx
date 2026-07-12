import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowRight, 
  Compass, 
  Truck, 
  Users, 
  ShieldCheck, 
  LineChart, 
  Settings, 
  Clock, 
  Sparkles,
  MapPin,
  CheckCircle,
  Database
} from 'lucide-react';
import { Button } from '../components/button/button';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);

  const workflowSteps = [
    { 
      title: 'Order Scheduling', 
      desc: 'Enter route requirements, destination, and cargo specifications in the scheduling console.',
      icon: Clock,
      detail: 'Specify routes such as Delhi ➔ Jaipur, cargo types like Automobile Parts, and calculate baseline revenue projections before dispatching.'
    },
    { 
      title: 'Operator Match', 
      desc: 'System recommends qualified, off-duty operators with valid licenses based on route constraints.',
      icon: Users,
      detail: 'Filter available operators by shift profiles (Morning, Evening, Night) and verify safety rating indicators dynamically.'
    },
    { 
      title: 'Telematics Dispatch', 
      desc: 'Assign available vehicles and stream real-time routes directly to driver mobile consoles.',
      icon: Truck,
      detail: 'Select the optimal asset (e.g. Tata Prima or Mahindra Furio) and monitor initial telematics gauges like fuel level and engine diagnostics.'
    },
    { 
      title: 'Real-time Progress', 
      desc: 'Track GPS positioning coordinates, odometer milestones, and cargo health metrics.',
      icon: Compass,
      detail: 'Receive automated FASTag toll deduction notifications and monitor instant ETA updates against delivery deadlines.'
    }
  ];

  const features = [
    { title: 'Fleet Assets Directory', desc: 'Centralized directory of vehicles with odometer metrics, fuel economy tracking, and active telemetry logs.', icon: Truck },
    { title: 'Driver Shift Dispatch', desc: 'Manage license expirations, safety compliance records, and active shifts with custom status badges.', icon: Users },
    { title: 'Dynamic Trip Control', desc: 'Real-time route completion trackers with progress meters, simulated SVG transit map routing, and cargo logs.', icon: Compass },
    { title: 'Maintenance Workshop', desc: 'Reduce breakdown overhead by logging repair expenses, service timelines, and active shop statuses.', icon: Settings },
    { title: 'Cost-Benefit Analytics', desc: 'Analyze operational statistics like Cost-per-Mile, category breakdowns, and individual vehicle ROI summaries.', icon: LineChart },
    { title: 'Robust Local Service DB', desc: 'Built-in client database running simulated asynchronous API delay for true client-server emulation.', icon: Database },
  ];

  return (
    <div className="min-h-screen bg-white text-slate-800 font-sans selection:bg-indigo-100 flex flex-col justify-between">
      
      {/* Navbar header */}
      <header className="border-b border-slate-100 py-4 px-6 md:px-12 flex justify-between items-center bg-white sticky top-0 z-30">
        <div className="flex items-center gap-2.5">
          <div className="bg-indigo-600 text-white p-1.5 rounded-lg">
            <Compass className="h-5 w-5" />
          </div>
          <div>
            <span className="text-base font-bold text-slate-900 tracking-tight">TransitOps</span>
            <span className="text-[9px] text-slate-400 font-semibold block uppercase tracking-wider -mt-1">Fleet Management</span>
          </div>
        </div>
        <div className="flex gap-4">
          <Button variant="outline" size="sm" onClick={() => navigate('/login')}>
            Sign In
          </Button>
          <Button variant="primary" size="sm" onClick={() => navigate('/signup')}>
            Get Started
          </Button>
        </div>
      </header>

      {/* Main hero */}
      <section className="py-20 px-6 md:px-12 max-w-7xl mx-auto text-center">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-semibold mb-6">
          <Sparkles className="h-3.5 w-3.5" />
          Enterprise Fleet Management Redefined
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight max-w-4xl mx-auto">
          Operational control, resource scheduling, & telematics in a unified portal.
        </h1>
        <p className="text-lg text-slate-500 mt-6 max-w-2xl mx-auto leading-relaxed">
          Manage trucks, schedule long-distance route dispatches, track fuel metrics, and audit ledger items in a high-fidelity workspace designed for professional logistics teams.
        </p>
        <div className="flex justify-center gap-4 mt-10">
          <Button variant="primary" size="lg" rightIcon={<ArrowRight className="h-4 w-4" />} onClick={() => navigate('/login')}>
            Enter Platform Demo
          </Button>
          <Button variant="outline" size="lg" onClick={() => navigate('/signup')}>
            Register Organization
          </Button>
        </div>

        {/* Dashboard preview placeholder */}
        <div className="mt-16 border border-slate-200 shadow-2xl rounded-2xl overflow-hidden bg-slate-50 max-w-5xl mx-auto p-2">
          <div className="bg-white rounded-xl border border-slate-150 p-6 flex flex-col gap-6 text-left">
            <div className="flex justify-between items-center pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 bg-red-400 rounded-full"></span>
                <span className="h-3 w-3 bg-yellow-400 rounded-full"></span>
                <span className="h-3 w-3 bg-green-400 rounded-full"></span>
                <span className="text-xs font-medium text-slate-400 ml-2">transitops-app-console</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <MapPin className="h-3.5 w-3.5" /> India Fleet Node
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {['Total Fleet: 15 Assets', 'Active Trips: 3 Dispatches', 'Utilization Rate: 78%', 'Telematics: Connected'].map((stat, i) => (
                <div key={i} className="p-4 border border-slate-150 bg-slate-50/50 rounded-lg">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Metrics</p>
                  <p className="text-sm font-bold text-slate-800 mt-1">{stat}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Business benefits */}
      <section className="py-20 bg-slate-50 border-y border-slate-100">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Engineered for Operational Performance</h2>
            <p className="text-slate-500 mt-2">Core business metrics driving modern supply chain logistics.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-xs">
              <div className="text-indigo-600 bg-indigo-50 p-3 rounded-xl w-fit mb-6">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Total Safety Compliance</h3>
              <p className="text-sm text-slate-500 mt-2 leading-relaxed">
                Automatically verify driver licensing compliance with visual warning alerts and automatic shift locks for invalid/expired operator records.
              </p>
            </div>
            <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-xs">
              <div className="text-indigo-600 bg-indigo-50 p-3 rounded-xl w-fit mb-6">
                <LineChart className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Resource Optimization</h3>
              <p className="text-sm text-slate-500 mt-2 leading-relaxed">
                Log real-time fuel efficiency ratings in Liters/100km, maintain odometer service warnings, and calculate capital ROI metrics instantly.
              </p>
            </div>
            <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-xs">
              <div className="text-indigo-600 bg-indigo-50 p-3 rounded-xl w-fit mb-6">
                <Compass className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Smart Dispatch Pipelines</h3>
              <p className="text-sm text-slate-500 mt-2 leading-relaxed">
                Map routes with animated progress trackers, monitor active telematics metrics, and evaluate operational costs against trip revenue logs.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Workflow section */}
      <section className="py-20 px-6 max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Interactive Dispatch Pipeline</h2>
          <p className="text-slate-500 mt-2">Click through the steps of our trip control pipeline to see TransitOps in action.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 items-center">
          
          {/* List of steps */}
          <div className="space-y-4">
            {workflowSteps.map((step, idx) => {
              const IconComp = step.icon;
              const isActive = activeStep === idx;
              return (
                <div
                  key={idx}
                  onClick={() => setActiveStep(idx)}
                  className={`p-5 rounded-xl border cursor-pointer transition-all duration-300 ${
                    isActive 
                      ? 'border-blue-300 bg-indigo-50/50 shadow-xs' 
                      : 'border-slate-200 hover:border-slate-350 hover:bg-slate-50/30'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`p-2 rounded-lg ${isActive ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                      <IconComp className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-slate-900">{step.title}</h4>
                      <p className="text-xs text-slate-500 mt-1 leading-normal">{step.desc}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Dynamic detail display */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-8 min-h-[320px] flex flex-col justify-between shadow-inner">
            <div>
              <span className="text-[10px] text-indigo-600 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                Stage {activeStep + 1} details
              </span>
              <h3 className="text-lg font-bold text-slate-900 mt-4">
                {workflowSteps[activeStep].title}
              </h3>
              <p className="text-sm text-slate-600 mt-3 leading-relaxed">
                {workflowSteps[activeStep].detail}
              </p>
            </div>
            <div className="flex items-center gap-3 pt-6 border-t border-slate-200 mt-6 text-xs text-slate-500 font-medium">
              <CheckCircle className="h-4 w-4 text-emerald-500" />
              SaaS control dashboard automatically syncs this state.
            </div>
          </div>
        </div>
      </section>

      {/* Platform Features Grid */}
      <section className="py-20 bg-slate-50 border-t border-slate-100">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Full-Scale ERP Modules</h2>
            <p className="text-slate-500 mt-2">Everything required to manage transport, driver shifts, and financials.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feat, idx) => {
              const Icon = feat.icon;
              return (
                <div key={idx} className="bg-white border border-slate-200 p-6 rounded-xl shadow-xs">
                  <div className="text-indigo-600 bg-indigo-50 p-2.5 rounded-lg w-fit mb-4">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h4 className="text-sm font-semibold text-slate-900">{feat.title}</h4>
                  <p className="text-xs text-slate-500 mt-2 leading-relaxed">{feat.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA section */}
      <section className="py-20 text-center px-6">
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Ready to Monitor Fleet Operations?</h2>
        <p className="text-sm text-slate-500 mt-2 max-w-sm mx-auto">
          Start your secure mock dispatcher session instantly. No database setup required.
        </p>
        <Button variant="primary" size="lg" className="mt-8" rightIcon={<ArrowRight className="h-4 w-4" />} onClick={() => navigate('/login')}>
          Enter Dispatcher Dashboard
        </Button>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 py-8 px-12 text-center text-xs text-slate-400 bg-white flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-2">
          <Compass className="h-4 w-4 text-slate-400" />
          <span className="font-semibold text-slate-500">TransitOps Enterprise SPA</span>
        </div>
        <p>© 2026 TransitOps. All Rights Reserved. Built with Vite + Tailwind + React.</p>
      </footer>
    </div>
  );
};
