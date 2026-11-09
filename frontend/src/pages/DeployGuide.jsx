import { useState } from 'react';
import { 
  Server, 
  Terminal, 
  Copy, 
  Check, 
  Globe, 
  ShieldCheck, 
  Layers, 
  Cpu, 
  ArrowUpRight, 
  CheckCircle2,
  ExternalLink
} from 'lucide-react';
import { PageHeader, Btn } from '../components/ui';
import api from '../lib/api';

export default function DeployGuide() {
  const [copiedKey, setCopiedKey] = useState(null);
  const [healthStatus, setHealthStatus] = useState(null);
  const [testingHealth, setTestingHealth] = useState(false);

  const copyText = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const testHealth = async () => {
    setTestingHealth(true);
    try {
      const res = await api.get('/health');
      setHealthStatus(res.data?.ok ? 'healthy' : 'degraded');
    } catch {
      setHealthStatus('error');
    } finally {
      setTestingHealth(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <PageHeader
          title="Production Deployment Guide"
          subtitle="Step-by-step instructions and configuration for deploying NexSphere TMS to Render.com, Docker, and Cloud platforms."
        />
        <div className="flex items-center gap-2">
          <Btn 
            tone="ghost" 
            onClick={testHealth} 
            disabled={testingHealth}
            className="text-xs flex items-center gap-1.5"
          >
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
            <span>{testingHealth ? 'Testing…' : 'Verify /health Route'}</span>
          </Btn>
          {healthStatus && (
            <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
              healthStatus === 'healthy' 
                ? 'bg-emerald-100 text-emerald-800' 
                : 'bg-rose-100 text-rose-800'
            }`}>
              <CheckCircle2 className="h-3 w-3" />
              <span>{healthStatus === 'healthy' ? 'API Healthy (200 OK)' : 'API Error'}</span>
            </span>
          )}
        </div>
      </div>

      {/* Primary: Render.com Deployment Steps */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-emerald-400">
            <Globe className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">Option 1: Deploy to Render.com (Recommended Web Service)</h2>
            <p className="text-xs text-slate-500">Fastest zero-configuration deployment for full-stack Node.js + Vite apps.</p>
          </div>
        </div>

        <div className="mt-5 space-y-5">
          {/* Step 1 */}
          <div className="flex gap-4">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-emerald-400">
              1
            </span>
            <div className="space-y-1.5 flex-1">
              <h3 className="text-sm font-bold text-slate-900">Create a New Web Service on Render</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Log into your dashboard at <a href="https://dashboard.render.com" target="_blank" rel="noreferrer" className="text-emerald-700 underline font-medium inline-flex items-center gap-0.5">render.com <ArrowUpRight className="h-3 w-3" /></a>, click <strong>New +</strong> and choose <strong>Web Service</strong>. Connect your GitHub or GitLab repository.
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex gap-4">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-emerald-400">
              2
            </span>
            <div className="space-y-2 flex-1">
              <h3 className="text-sm font-bold text-slate-900">Configure Build & Runtime Settings</h3>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-3">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">Runtime</span>
                  <span className="text-xs font-bold text-slate-900 font-mono">Node</span>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-3">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">Root Directory</span>
                  <span className="text-xs font-bold text-slate-900 font-mono">. (Leave blank)</span>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Build Command</span>
                    <button 
                      onClick={() => copyText('npm install --legacy-peer-deps && npm run build', 'bld')}
                      className="text-slate-400 hover:text-slate-700"
                    >
                      {copiedKey === 'bld' ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                  <code className="text-xs font-bold text-emerald-800 font-mono">npm install --legacy-peer-deps && npm run build</code>
                  <p className="mt-1 text-[10px] text-slate-500">Includes .npmrc legacy-peer-deps=true to prevent peer resolution conflicts.</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Start Command</span>
                    <button 
                      onClick={() => copyText('npm start', 'start')}
                      className="text-slate-400 hover:text-slate-700"
                    >
                      {copiedKey === 'start' ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                  <code className="text-xs font-bold text-emerald-800 font-mono">npm start</code>
                </div>
              </div>
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex gap-4">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-emerald-400">
              3
            </span>
            <div className="space-y-2 flex-1">
              <h3 className="text-sm font-bold text-slate-900">Set Environment Variables (Render Dashboard)</h3>
              <p className="text-xs text-slate-600">
                In the <strong>Environment</strong> section of your Render Web Service settings, add the following key-value pairs:
              </p>
              <div className="rounded-xl border border-slate-800 bg-slate-950 p-3.5 font-mono text-xs text-slate-200 overflow-x-auto space-y-1">
                <div className="text-emerald-400">NODE_ENV=production</div>
                <div className="text-slate-300">PORT=10000 <span className="text-slate-500"># Set automatically by Render</span></div>
                <div className="text-slate-300">SUPABASE_URL=https://your-project.supabase.co <span className="text-slate-500"># Optional</span></div>
                <div className="text-slate-300">SUPABASE_ANON_KEY=your-anon-key <span className="text-slate-500"># Optional</span></div>
              </div>
            </div>
          </div>

          {/* Step 4 */}
          <div className="flex gap-4">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-emerald-400">
              4
            </span>
            <div className="space-y-1.5 flex-1">
              <h3 className="text-sm font-bold text-slate-900">Configure Health Check & Deploy</h3>
              <p className="text-xs text-slate-600">
                Under <strong>Advanced Settings</strong>, set Health Check Path to <code className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-900 font-bold">/health</code>. Click <strong>Create Web Service</strong> to trigger the initial deployment.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Alternative Options: Docker & VPS */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Dockerfile */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Layers className="h-4 w-4 text-slate-700" />
              <h3 className="text-sm font-bold text-slate-900">Option 2: Docker Container</h3>
            </div>
            <p className="text-xs text-slate-500 mb-3">
              Deploy as a portable container to Google Cloud Run, AWS ECS, or DigitalOcean:
            </p>
            <div className="rounded-xl border border-slate-800 bg-slate-950 p-3 font-mono text-[11px] text-slate-300 overflow-x-auto leading-relaxed">
              <span className="text-slate-500"># 1. Build Docker image</span><br/>
              docker build -t nexsphere-edu .<br/><br/>
              <span className="text-slate-500"># 2. Run container on port 3000</span><br/>
              docker run -p 3000:3000 -e NODE_ENV=production nexsphere-edu
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Entrypoint: <code className="text-slate-800 font-mono">server.js</code></span>
            <button 
              onClick={() => copyText('docker build -t nexsphere-edu . && docker run -p 3000:3000 nexsphere-edu', 'docker')}
              className="text-xs font-semibold text-slate-800 hover:text-emerald-700 underline flex items-center gap-1"
            >
              {copiedKey === 'docker' ? 'Copied!' : 'Copy Commands'}
            </button>
          </div>
        </div>

        {/* Linux / VPS / PM2 */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Cpu className="h-4 w-4 text-slate-700" />
              <h3 className="text-sm font-bold text-slate-900">Option 3: VPS / Ubuntu with PM2</h3>
            </div>
            <p className="text-xs text-slate-500 mb-3">
              Deploy to a dedicated virtual machine running Ubuntu or Debian with PM2:
            </p>
            <div className="rounded-xl border border-slate-800 bg-slate-950 p-3 font-mono text-[11px] text-slate-300 overflow-x-auto leading-relaxed">
              git clone &lt;your-repo-url&gt; && cd applet<br/>
              npm install --legacy-peer-deps<br/>
              npm run build<br/>
              pm2 start server.js --name &quot;nexsphere&quot;
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Daemon: <code className="text-slate-800 font-mono">pm2</code></span>
            <button 
              onClick={() => copyText('npm install --legacy-peer-deps && npm run build && pm2 start server.js --name "nexsphere"', 'pm2')}
              className="text-xs font-semibold text-slate-800 hover:text-emerald-700 underline flex items-center gap-1"
            >
              {copiedKey === 'pm2' ? 'Copied!' : 'Copy Commands'}
            </button>
          </div>
        </div>
      </div>

      {/* Production Readiness Verification Strip */}
      <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-4 text-xs text-emerald-950 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
          <div>
            <p className="font-bold">Production Server Ready</p>
            <p className="text-[11px] text-emerald-800">
              <code className="font-mono font-bold">server.js</code> native Node runtime configured to serve optimized frontend assets and handle all API endpoints with zero-trust role isolation.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="font-mono text-[11px] bg-white border border-emerald-300 px-2 py-1 rounded text-slate-700">
            Build: dist/
          </span>
          <span className="font-mono text-[11px] bg-white border border-emerald-300 px-2 py-1 rounded text-slate-700">
            Port: 3000 / $PORT
          </span>
        </div>
      </div>
    </div>
  );
}
