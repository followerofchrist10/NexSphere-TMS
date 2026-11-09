import { useCallback, useEffect, useState } from 'react';
import { Plus, Receipt, Shield, DollarSign } from 'lucide-react';
import api, { errorMessage } from '../lib/api';
import { useAuth } from '../lib/auth';
import { useDebounced } from '../lib/hooks';
import { Alert, Badge, Btn, Empty, Loading, Modal, PageHeader, Pager, Pills, SearchBox, fmtDate, fmtDateTime, money } from '../components/ui';

const STATUS = [
  { value: '', label: 'All' },
  { value: 'unpaid', label: 'Unpaid' },
  { value: 'partial', label: 'Partly paid' },
  { value: 'paid', label: 'Paid' },
];

export default function Invoices() {
  const { profile } = useAuth();
  const isAdmin = profile?.role === 'admin';
  const staff = ['staff', 'admin'].includes(profile?.role);
  const [rows, setRows] = useState([]);
  const [meta, setMeta] = useState(null);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const dSearch = useDebounced(search);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const [ok, setOk] = useState('');
  const [paying, setPaying] = useState(null);
  const [receipts, setReceipts] = useState(null);
  const [createDueOpen, setCreateDueOpen] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await api.get('/api/invoices', {
        params: { page, pageSize: 15, status: status || undefined, search: dSearch || undefined },
      });
      setRows(r.data.data);
      setMeta(r.data.meta);
      setErr('');
    } catch (e) {
      setErr(errorMessage(e));
    } finally {
      setLoading(false);
    }
  }, [page, status, dSearch]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => setPage(1), [status, dSearch]);

  const openReceipts = async (inv) => {
    setReceipts({ inv, list: null });
    try {
      const r = await api.get(`/api/invoices/${inv.id}/payments`);
      setReceipts({ inv, list: r.data.data });
    } catch (e) {
      setReceipts(null);
      setErr(errorMessage(e));
    }
  };

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <PageHeader
          title={isAdmin ? 'Dues & Billing Setup' : staff ? 'Invoices & Payments' : 'My Tuition Dues & Receipts'}
          subtitle={
            isAdmin
              ? 'Administrator Dues Management: Set up course tuition dues, issue invoices, and manage trainee financial ledgers.'
              : staff
              ? 'Record payments, issue official receipts, and review balances.'
              : 'Official training fee schedule, balance tracking, and cryptographic payment receipts.'
          }
        >
          {staff && <SearchBox value={search} onChange={setSearch} placeholder="Search by trainee" />}
        </PageHeader>

        {isAdmin && (
          <Btn onClick={() => setCreateDueOpen(true)} className="self-start text-xs flex items-center gap-1.5">
            <Plus className="h-3.5 w-3.5" />
            <span>Set Up Dues / Create Invoice</span>
          </Btn>
        )}
      </div>

      <div className="mt-4">
        <Pills options={STATUS} value={status} onChange={setStatus} label="Filter by payment status" />
      </div>

      <div className="mt-4 space-y-2" aria-live="polite">
        <Alert tone="ok">{ok}</Alert>
        <Alert onRetry={load}>{err}</Alert>
      </div>

      <div className="mt-4 overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-2xs">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50 text-left font-semibold text-slate-600 text-xs uppercase tracking-wider">
            <tr>
              <th className="px-4 py-3">Invoice</th>
              {staff && <th className="px-4 py-3">Trainee</th>}
              <th className="px-4 py-3">Description / Program</th>
              <th className="px-4 py-3">Amount</th>
              <th className="px-4 py-3">Paid</th>
              <th className="px-4 py-3">Balance</th>
              <th className="px-4 py-3">Due Date</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {rows.map((i) => {
              const bal = Number(i.amount) - Number(i.amount_paid);
              return (
                <tr key={i.id} className="align-top hover:bg-slate-50/70 transition-colors">
                  <td className="whitespace-nowrap px-4 py-3 font-bold font-mono text-slate-900">{i.invoice_no}</td>
                  {staff && (
                    <td className="px-4 py-3">
                      <div className="font-semibold text-slate-900">{i.student?.full_name}</div>
                      <div className="text-slate-400 font-mono text-[11px]">{i.student?.email}</div>
                    </td>
                  )}
                  <td className="px-4 py-3">
                    <div className="font-medium text-slate-800">
                      {i.application?.batch?.course?.title || i.notes || 'Technical Training Course Tuition'}
                    </div>
                    {i.application?.batch?.name && (
                      <div className="text-slate-400 text-[11px]">{i.application.batch.name}</div>
                    )}
                  </td>
                  <td className="px-4 py-3 tabular-nums font-semibold">{money(i.amount)}</td>
                  <td className="px-4 py-3 tabular-nums text-emerald-600">{money(i.amount_paid)}</td>
                  <td className="px-4 py-3 tabular-nums font-bold text-slate-900">{money(bal)}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-slate-600 font-mono">{fmtDate(i.due_on)}</td>
                  <td className="px-4 py-3">
                    <Badge value={i.status} />
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <div className="flex gap-2">
                      {staff && bal > 0 && i.status !== 'void' && (
                        <Btn tone="green" onClick={() => setPaying(i)} className="text-xs py-1">
                          Record payment
                        </Btn>
                      )}
                      <Btn tone="ghost" onClick={() => openReceipts(i)} className="text-xs py-1">
                        Receipts
                      </Btn>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {loading && rows.length === 0 && <div className="p-8"><Loading label="Retrieving dues ledger..." /></div>}
        {!loading && !err && rows.length === 0 && (
          <div className="p-8 text-center">
            <Empty>No invoices or dues currently match. Administrator can establish dues above.</Empty>
          </div>
        )}
      </div>
      <Pager page={page} meta={meta} setPage={setPage} loading={loading} />

      {/* Admin Create / Set Up Dues Modal */}
      {createDueOpen && (
        <CreateDueModal
          onClose={() => setCreateDueOpen(false)}
          onDone={() => {
            setCreateDueOpen(false);
            setOk('Dues notice established successfully.');
            load();
          }}
        />
      )}

      {paying && (
        <PaymentModal
          inv={paying}
          onClose={() => setPaying(null)}
          onDone={() => {
            setPaying(null);
            setOk('Payment recorded and receipt issued.');
            load();
          }}
        />
      )}

      {receipts && (
        <Modal title={`Receipts: ${receipts.inv.invoice_no}`} onClose={() => setReceipts(null)}>
          {!receipts.list ? (
            <Loading />
          ) : receipts.list.length === 0 ? (
            <Empty>No payments recorded for this invoice yet.</Empty>
          ) : (
            <ul className="divide-y divide-slate-100 text-sm">
              {receipts.list.map((p) => (
                <li key={p.id} className="flex items-center justify-between gap-3 py-2.5">
                  <div>
                    <p className="font-bold text-slate-900 font-mono">{p.receipt_no}</p>
                    <p className="text-slate-500 text-xs">
                      {fmtDateTime(p.paid_at)} · {p.method.replace('_', ' ')}
                    </p>
                  </div>
                  <span className="tabular-nums font-bold text-emerald-700">{money(p.amount)}</span>
                </li>
              ))}
            </ul>
          )}
          <div className="mt-4 flex justify-end">
            <Btn tone="ghost" onClick={() => window.print()}>
              Print Receipt
            </Btn>
          </div>
        </Modal>
      )}
    </section>
  );
}

function CreateDueModal({ onClose, onDone }) {
  const [students, setStudents] = useState([]);
  const [studentId, setStudentId] = useState('');
  const [amount, setAmount] = useState('14500');
  const [dueOn, setDueOn] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toISOString().slice(0, 10);
  });
  const [notes, setNotes] = useState('Cloud Systems Architecture Professional Track Tuition');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api
      .get('/api/students', { params: { pageSize: 100 } })
      .then((r) => {
        const list = r.data.data || [];
        setStudents(list);
        if (list.length > 0) setStudentId(list[0].id);
      })
      .catch((e) => setErr(errorMessage(e)));
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    setErr('');
    setBusy(true);
    try {
      await api.post('/api/invoices', {
        student_id: studentId,
        amount: Number(amount),
        due_on: dueOn,
        notes,
      });
      onDone();
    } catch (x) {
      setErr(errorMessage(x));
      setBusy(false);
    }
  };

  return (
    <Modal title="Set Up Student Dues / Create Invoice" onClose={onClose}>
      <form onSubmit={submit} className="space-y-3.5">
        <div className="rounded-xl bg-slate-50 border border-slate-200 p-3 text-xs text-slate-600">
          <p className="font-bold text-slate-800">Administrator Dues Generation</p>
          <p className="mt-0.5 text-[11px] text-slate-500">
            This creates an official billing notice for the selected student trainee.
          </p>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700">Select Trainee *</label>
          <select
            required
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
            className="mt-1 w-full rounded-md border-slate-300 text-xs shadow-xs focus:ring-slate-500"
          >
            {students.map((st) => (
              <option key={st.id} value={st.id}>
                {st.full_name} ({st.email})
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700">Tuition Amount ($) *</label>
            <input
              type="number"
              min="1"
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="mt-1 w-full rounded-md border-slate-300 text-xs shadow-xs focus:ring-slate-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700">Due Date *</label>
            <input
              type="date"
              required
              value={dueOn}
              onChange={(e) => setDueOn(e.target.value)}
              className="mt-1 w-full rounded-md border-slate-300 text-xs shadow-xs focus:ring-slate-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700">Tuition Notes / Course Title</label>
          <input
            type="text"
            required
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="mt-1 w-full rounded-md border-slate-300 text-xs shadow-xs focus:ring-slate-500"
          />
        </div>

        <Alert>{err}</Alert>

        <div className="flex justify-end gap-2 pt-2">
          <Btn type="button" tone="ghost" onClick={onClose}>
            Cancel
          </Btn>
          <Btn type="submit" disabled={busy}>
            {busy ? 'Establishing Dues…' : 'Issue Invoice Notice'}
          </Btn>
        </div>
      </form>
    </Modal>
  );
}

function PaymentModal({ inv, onClose, onDone }) {
  const balance = Number(inv.amount) - Number(inv.amount_paid);
  const [amount, setAmount] = useState(String(balance));
  const [method, setMethod] = useState('card');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setErr('');
    setBusy(true);
    try {
      await api.post(`/api/invoices/${inv.id}/payments`, { amount: Number(amount), method });
      onDone();
    } catch (x) {
      setErr(errorMessage(x));
      setBusy(false);
    }
  };

  return (
    <Modal title={`Record Payment: ${inv.invoice_no}`} onClose={onClose}>
      <form onSubmit={submit} className="space-y-3">
        <p className="text-xs text-slate-600">
          Trainee: <strong>{inv.student?.full_name}</strong> · Outstanding Balance:{' '}
          <strong className="text-slate-900">{money(balance)}</strong>
        </p>
        <label className="block text-xs font-semibold text-slate-700">
          Payment Amount ($)
          <input
            type="number"
            step="0.01"
            min="0.01"
            max={balance}
            required
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="mt-1 w-full rounded-md border-slate-300 text-xs shadow-xs focus:ring-slate-500"
          />
        </label>
        <label className="block text-xs font-semibold text-slate-700">
          Payment Method
          <select
            value={method}
            onChange={(e) => setMethod(e.target.value)}
            className="mt-1 w-full rounded-md border-slate-300 text-xs shadow-xs focus:ring-slate-500"
          >
            {['card', 'bank_transfer', 'upi', 'cash', 'other'].map((m) => (
              <option key={m} value={m}>
                {m.replace('_', ' ').toUpperCase()}
              </option>
            ))}
          </select>
        </label>
        <Alert>{err}</Alert>
        <div className="flex justify-end gap-2 pt-2">
          <Btn type="button" tone="ghost" onClick={onClose}>
            Cancel
          </Btn>
          <Btn tone="green" type="submit" disabled={busy}>
            {busy ? 'Recording…' : 'Confirm & Issue Receipt'}
          </Btn>
        </div>
      </form>
    </Modal>
  );
}