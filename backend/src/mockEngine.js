import {
  mockUsers,
  mockAssets,
  mockCourses,
  mockBatches,
  mockLectures,
  mockAttendance,
  mockGrades,
  mockInvoices,
  mockNotifications,
  mockApplications,
  mockCertificates,
  mockSubmissions,
} from './mockStore.js';

// Deep clone mutable data tables
export const tables = {
  profiles: [...mockUsers],
  assets: [...mockAssets],
  courses: [...mockCourses],
  batches: [...mockBatches],
  lectures: [...mockLectures],
  attendance: [...mockAttendance],
  grades: [...mockGrades],
  invoices: [...mockInvoices],
  notifications: [...mockNotifications],
  applications: [...mockApplications],
  certificates: [...mockCertificates],
  submissions: [...mockSubmissions],
  payments: [],
  application_status_history: [],
};

function enrichRow(table, row) {
  if (!row) return row;
  const cloned = { ...row };

  if (table === 'batches') {
    cloned.course = tables.courses.find((c) => c.id === cloned.course_id) || null;
    cloned.instructor = tables.profiles.find((p) => p.id === cloned.instructor_id) || null;
    cloned.asset = tables.assets.find((a) => a.id === cloned.asset_id) || null;
  } else if (table === 'attendance') {
    cloned.batch = tables.batches.find((b) => b.id === cloned.batch_id) || null;
    cloned.student = tables.profiles.find((p) => p.id === cloned.student_id) || null;
    cloned.lecture = tables.lectures.find((l) => l.id === cloned.lecture_id) || null;
  } else if (table === 'grades') {
    cloned.batch = tables.batches.find((b) => b.id === cloned.batch_id) || null;
    cloned.student = tables.profiles.find((p) => p.id === cloned.student_id) || null;
  } else if (table === 'invoices') {
    cloned.student = tables.profiles.find((p) => p.id === cloned.student_id) || null;
    cloned.application = {
      batch: tables.batches.find((b) => b.id === 'btc-cloud-a')
        ? {
            name: 'Cloud Systems Training',
            course: { title: 'Distributed Systems & Cloud Microservices' },
          }
        : null,
    };
  } else if (table === 'applications') {
    cloned.student = tables.profiles.find((p) => p.id === cloned.student_id) || null;
    cloned.batch = tables.batches.find((b) => b.id === cloned.batch_id) || null;
  }
  return cloned;
}

export class MockQueryBuilder {
  constructor(tableName, currentUser = null) {
    this.tableName = tableName;
    this.currentUser = currentUser;
    this.filters = [];
    this.sortCol = null;
    this.sortAsc = true;
    this.offsetVal = 0;
    this.limitVal = null;
    this.isSingle = false;
    this.isHead = false;
    this.countExact = false;
    this.action = 'select'; // 'select', 'insert', 'update', 'delete', 'upsert'
    this.payload = null;
  }

  select(fields = '*', options = {}) {
    if (options.count === 'exact') this.countExact = true;
    if (options.head) this.isHead = true;
    return this;
  }

  eq(col, val) {
    this.filters.push((r) => String(r[col]) === String(val));
    return this;
  }

  neq(col, val) {
    this.filters.push((r) => String(r[col]) !== String(val));
    return this;
  }

  gte(col, val) {
    this.filters.push((r) => r[col] >= val);
    return this;
  }

  lte(col, val) {
    this.filters.push((r) => r[col] <= val);
    return this;
  }

  ilike(col, pattern) {
    const clean = String(pattern).replace(/%/g, '').toLowerCase();
    this.filters.push((r) => {
      const target = String(r[col] || '').toLowerCase();
      return target.includes(clean);
    });
    return this;
  }

  order(col, { ascending = true } = {}) {
    this.sortCol = col;
    this.sortAsc = ascending;
    return this;
  }

  range(from, to) {
    this.offsetVal = from;
    this.limitVal = to - from + 1;
    return this;
  }

  limit(n) {
    this.limitVal = n;
    return this;
  }

  single() {
    this.isSingle = true;
    return this;
  }

  insert(data) {
    this.action = 'insert';
    this.payload = data;
    return this;
  }

  update(data) {
    this.action = 'update';
    this.payload = data;
    return this;
  }

  delete() {
    this.action = 'delete';
    return this;
  }

  upsert(rows, _opts) {
    this.action = 'upsert';
    this.payload = Array.isArray(rows) ? rows : [rows];
    return this;
  }

  execute() {
    const list = tables[this.tableName];
    if (!list) {
      return { data: this.isSingle ? null : [], error: null, count: 0 };
    }

    if (this.action === 'insert') {
      const items = Array.isArray(this.payload) ? this.payload : [this.payload];
      const inserted = items.map((item) => {
        const id = item.id || `id-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
        const row = { id, created_at: new Date().toISOString(), ...item };
        list.push(row);
        return enrichRow(this.tableName, row);
      });
      return {
        data: this.isSingle ? inserted[0] : inserted,
        error: null,
      };
    }

    if (this.action === 'upsert') {
      const rows = this.payload || [];
      rows.forEach((r) => {
        const idx = list.findIndex(
          (existing) =>
            (r.id && existing.id === r.id) ||
            (existing.batch_id === r.batch_id &&
              existing.student_id === r.student_id &&
              existing.on_date === r.on_date)
        );
        if (idx >= 0) {
          list[idx] = { ...list[idx], ...r };
        } else {
          list.push({
            id: r.id || `att-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            ...r,
          });
        }
      });
      return { data: rows, error: null };
    }

    if (this.action === 'update') {
      let updated = [];
      list.forEach((r, idx) => {
        if (this.filters.every((fn) => fn(r))) {
          list[idx] = { ...r, ...this.payload };
          updated.push(enrichRow(this.tableName, list[idx]));
        }
      });
      return {
        data: this.isSingle ? updated[0] || null : updated,
        error: null,
      };
    }

    if (this.action === 'delete') {
      const toDelete = [];
      tables[this.tableName] = list.filter((r) => {
        const match = this.filters.every((fn) => fn(r));
        if (match) toDelete.push({ id: r.id });
        return !match;
      });
      return { data: toDelete, error: null };
    }

    // Default: 'select'
    let results = list.filter((r) => this.filters.every((fn) => fn(r)));
    const totalCount = results.length;

    if (this.sortCol) {
      results.sort((a, b) => {
        const valA = a[this.sortCol];
        const valB = b[this.sortCol];
        if (valA < valB) return this.sortAsc ? -1 : 1;
        if (valA > valB) return this.sortAsc ? 1 : -1;
        return 0;
      });
    }

    if (this.offsetVal > 0) {
      results = results.slice(this.offsetVal);
    }
    if (this.limitVal !== null && this.limitVal !== undefined) {
      results = results.slice(0, this.limitVal);
    }

    const enriched = results.map((r) => enrichRow(this.tableName, r));

    if (this.isHead) {
      return { data: null, count: totalCount, error: null };
    }

    if (this.isSingle) {
      return { data: enriched[0] || null, error: null };
    }

    return { data: enriched, count: totalCount, error: null };
  }

  then(resolve, reject) {
    try {
      const res = this.execute();
      resolve(res);
    } catch (err) {
      reject(err);
    }
  }
}

export function createMockClient(user = null) {
  return {
    from(tableName) {
      return new MockQueryBuilder(tableName, user);
    },
    async rpc(funcName, args = {}) {
      if (funcName === 'dashboard_summary') {
        const totalCourses = tables.courses.length;
        const totalBatches = tables.batches.length;
        const totalStudents = tables.profiles.filter((p) => p.role === 'student').length;
        const totalRev = tables.invoices.reduce((sum, inv) => sum + (inv.amount_paid || 0), 0);
        return {
          data: {
            courses: totalCourses,
            batches: totalBatches,
            students: totalStudents,
            revenue: totalRev,
            attendance_rate: 84.5,
          },
          error: null,
        };
      }

      if (funcName === 'open_batches') {
        const open = tables.batches
          .filter((b) => b.is_open)
          .map((b) => enrichRow('batches', b));
        return { data: open, error: null };
      }

      if (funcName === 'batch_roster') {
        const batchId = args.p_batch;
        const enrolled = tables.applications
          .filter((a) => a.batch_id === batchId && a.status === 'approved')
          .map((a) => {
            const student = tables.profiles.find((p) => p.id === a.student_id);
            return {
              student_id: a.student_id,
              full_name: student?.full_name || 'Enrolled Student',
              email: student?.email || 'student@nexsphere.edu',
            };
          });
        return { data: enrolled, error: null };
      }

      if (funcName === 'record_payment') {
        const invoice = tables.invoices.find((i) => i.id === args.p_invoice);
        if (invoice) {
          invoice.amount_paid = (invoice.amount_paid || 0) + Number(args.p_amount);
          if (invoice.amount_paid >= invoice.amount) invoice.status = 'paid';
          else if (invoice.amount_paid > 0) invoice.status = 'partial';
        }
        return { data: { success: true }, error: null };
      }

      if (funcName === 'report_monthly_revenue') {
        return {
          data: [
            { month: '2026-06', revenue: 42000, payments: 3 },
            { month: '2026-07', revenue: 58000, payments: 4 },
            { month: '2026-08', revenue: 72000, payments: 5 },
            { month: '2026-09', revenue: 95000, payments: 7 },
            { month: '2026-10', revenue: 110000, payments: 8 },
            { month: '2026-11', revenue: 125500, payments: 9 },
          ],
          error: null,
        };
      }

      if (funcName === 'report_enrollment_trend') {
        return {
          data: [
            { month: '2026-06', submitted: 12, approved: 10, rejected: 2 },
            { month: '2026-07', submitted: 18, approved: 16, rejected: 2 },
            { month: '2026-08', submitted: 25, approved: 22, rejected: 3 },
            { month: '2026-09', submitted: 35, approved: 30, rejected: 5 },
            { month: '2026-10', submitted: 42, approved: 38, rejected: 4 },
            { month: '2026-11', submitted: 50, approved: 46, rejected: 4 },
          ],
          error: null,
        };
      }

      if (funcName === 'report_course_enrollment') {
        return {
          data: tables.courses.map((c) => ({
            title: c.title,
            enrolled: 24,
            invoiced: c.price * 24,
            collected: c.price * 20,
          })),
          error: null,
        };
      }

      return { data: [], error: null };
    },
  };
}
