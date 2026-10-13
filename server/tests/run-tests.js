const http = require('http');
const dotenv = require('dotenv');
dotenv.config();

// Ensure test environment uses memory DB
process.env.USE_IN_MEMORY_DB = 'true';
process.env.NODE_ENV = 'test';

const mongoose = require('mongoose');
const { connectDB, disconnectDB } = require('../src/config/db');
const app = require('../src/app');
const User = require('../src/models/User');
const Item = require('../src/models/Item');
const Claim = require('../src/models/Claim');

let testServer;
let baseUrl;

async function request(path, options = {}) {
  const url = `${baseUrl}${path}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  const fetchOptions = {
    method: options.method || 'GET',
    headers,
  };

  if (options.body) {
    fetchOptions.body = JSON.stringify(options.body);
  }

  const res = await fetch(url, fetchOptions);
  let data = null;
  try {
    data = await res.json();
  } catch (err) {
    data = null;
  }

  return {
    status: res.status,
    headers: res.headers,
    data,
  };
}

let passedCount = 0;
let failedCount = 0;

function assert(condition, testName) {
  if (condition) {
    console.log(`  ✅ PASS: ${testName}`);
    passedCount++;
  } else {
    console.error(`  ❌ FAIL: ${testName}`);
    failedCount++;
  }
}

async function runTests() {
  console.log('\n======================================================');
  console.log('🧪 RUNNING CAMPUSCONNECT AUTOMATED TEST SUITE');
  console.log('======================================================\n');

  try {
    await connectDB();
    await User.deleteMany({});
    await Item.deleteMany({});
    await Claim.deleteMany({});

    testServer = http.createServer(app);
    await new Promise((resolve) => {
      testServer.listen(0, () => {
        const port = testServer.address().port;
        baseUrl = `http://localhost:${port}`;
        resolve();
      });
    });

    console.log(`[Tests] Server running on test port ${testServer.address().port}`);

    // --- TEST 1: Health Check ---
    console.log('\n[Suite 1: System & Health]');
    const healthRes = await request('/api/health');
    assert(healthRes.status === 200 && healthRes.data.status === 'healthy', 'Health check endpoint returns 200 OK');

    // --- TEST 2: Registration Validation & Success ---
    console.log('\n[Suite 2: Authentication & Validation]');
    const malformedReg = await request('/api/auth/register', {
      method: 'POST',
      body: { name: 'A', email: 'not-an-email' },
    });
    assert(malformedReg.status === 400, 'Registration rejects invalid email and short name (400)');

    const validReg = await request('/api/auth/register', {
      method: 'POST',
      body: {
        name: 'Test Student',
        email: 'test.student@campusconnect.edu.in',
        studentId: '22CS9999',
        department: 'Computer Science',
        yearOfStudy: '3rd Year',
        password: 'Password@123',
        confirmPassword: 'Password@123',
        termsAccepted: true,
      },
    });
    assert(validReg.status === 201 && validReg.data.success === true, 'Successful student registration returns 201 Created');
    assert(!validReg.data.user.passwordHash, 'User response does not expose passwordHash');

    const duplicateReg = await request('/api/auth/register', {
      method: 'POST',
      body: {
        name: 'Duplicate Student',
        email: 'test.student@campusconnect.edu.in',
        studentId: '22CS8888',
        department: 'IT',
        yearOfStudy: '2nd Year',
        password: 'Password@123',
        confirmPassword: 'Password@123',
        termsAccepted: true,
      },
    });
    assert(duplicateReg.status === 409, 'Duplicate email registration returns 409 Conflict');

    // --- TEST 3: Login Success & Failure ---
    const invalidLogin = await request('/api/auth/login', {
      method: 'POST',
      body: { email: 'test.student@campusconnect.edu.in', password: 'WrongPassword' },
    });
    assert(invalidLogin.status === 401, 'Login fails with incorrect password (401)');

    const validLogin = await request('/api/auth/login', {
      method: 'POST',
      body: { email: 'test.student@campusconnect.edu.in', password: 'Password@123' },
    });
    assert(validLogin.status === 200 && validLogin.data.token, 'Login succeeds and returns JWT token');
    const studentToken = validLogin.data.token;
    const studentUser = validLogin.data.user;

    // --- TEST 4: Setup Admin & Role Verification ---
    console.log('\n[Suite 3: Role Authorization]');
    const adminPasswordHash = await User.hashPassword('Admin@1234');
    const adminDoc = await User.create({
      name: 'Admin Test',
      email: 'admin.test@campusconnect.edu.in',
      studentId: 'ADMIN-999',
      department: 'CSE',
      yearOfStudy: 'Faculty/Staff',
      passwordHash: adminPasswordHash,
      role: 'admin',
    });

    const adminLogin = await request('/api/auth/login', {
      method: 'POST',
      body: { email: 'admin.test@campusconnect.edu.in', password: 'Admin@1234' },
    });
    const adminToken = adminLogin.data.token;

    const studentAccessAdmin = await request('/api/admin/stats', {
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    assert(studentAccessAdmin.status === 403, 'Regular student is denied access to admin stats (403)');

    const adminAccessAdmin = await request('/api/admin/stats', {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(adminAccessAdmin.status === 200 && adminAccessAdmin.data.stats, 'Administrator can access admin stats (200)');

    // --- TEST 5: Item Creation & Listing ---
    console.log('\n[Suite 4: Items & Search]');
    const createLostRes = await request('/api/items', {
      method: 'POST',
      headers: { Authorization: `Bearer ${studentToken}` },
      body: {
        title: 'Lost Blue Backpack',
        description: 'Navy blue Nike backpack with laptop compartment and keychain.',
        category: 'Bags & Wallets',
        reportType: 'lost',
        approximateLocation: 'Central Library - Reading Room',
      },
    });
    assert(createLostRes.status === 201 && createLostRes.data.item.title === 'Lost Blue Backpack', 'Student can report a lost item (201)');
    const lostItem = createLostRes.data.item;

    const createFoundRes = await request('/api/items', {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: {
        title: 'Found Blue Nike Backpack',
        description: 'Navy blue Nike backpack found on 2nd floor library reading table.',
        category: 'Bags & Wallets',
        reportType: 'found',
        approximateLocation: 'Central Library - Reading Room',
        custodyStatus: 'campus_office',
      },
    });
    assert(createFoundRes.status === 201 && createFoundRes.data.item.reportType === 'found', 'User can report a found item (201)');
    const foundItem = createFoundRes.data.item;

    const listRes = await request('/api/items?search=Backpack&category=Bags %26 Wallets');
    assert(listRes.status === 200 && listRes.data.items.length >= 2, 'Search and category filter returns matching items');

    // --- TEST 6: Ownership Claim Workflow ---
    console.log('\n[Suite 5: Ownership Claims & Verification]');
    const selfClaim = await request('/api/claims', {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: {
        itemId: foundItem._id,
        explanation: 'Attempting to claim own reported item.',
      },
    });
    assert(selfClaim.status === 400, 'Reporter cannot claim their own found item report (400)');

    const validClaim = await request('/api/claims', {
      method: 'POST',
      headers: { Authorization: `Bearer ${studentToken}` },
      body: {
        itemId: foundItem._id,
        explanation: 'This is my Nike backpack with my notebook inside and specific blue zip.',
        secretIdentifiers: 'Has an ink stain on the right water bottle pouch.',
      },
    });
    assert(validClaim.status === 201 && validClaim.data.claim.status === 'pending', 'Student can submit ownership claim with private evidence (201)');
    const claimId = validClaim.data.claim._id;

    const duplicateClaim = await request('/api/claims', {
      method: 'POST',
      headers: { Authorization: `Bearer ${studentToken}` },
      body: {
        itemId: foundItem._id,
        explanation: 'Second duplicate claim attempt.',
      },
    });
    assert(duplicateClaim.status === 409, 'Duplicate active claim for same item is prevented (409)');

    // Admin reviews and approves the claim
    const approveClaim = await request(`/api/admin/claims/${claimId}/review`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: {
        status: 'approved',
        reviewNotes: 'Identifier matched with student proof. Verified by library desk.',
        confirmHandover: true,
      },
    });
    assert(approveClaim.status === 200 && approveClaim.data.claim.status === 'approved', 'Admin can review and approve claim (200)');

    // Verify item status updated to recovered
    const updatedItemRes = await request(`/api/items/${foundItem._id}`);
    assert(updatedItemRes.status === 200 && updatedItemRes.data.item.status === 'recovered', 'Approved claim with handover marks item as recovered');

    // --- TEST 7: Notifications & Audit Trail ---
    console.log('\n[Suite 6: Notifications & Audit]');
    const studentNotifs = await request('/api/notifications', {
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    assert(studentNotifs.status === 200 && studentNotifs.data.notifications.length > 0, 'Student receives in-app notifications for claim updates');

    const auditRes = await request('/api/admin/audit-logs', {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(auditRes.status === 200 && auditRes.data.logs.length >= 4, 'Audit trail records all critical platform actions');

    console.log('\n======================================================');
    console.log(`TEST RESULTS: ${passedCount} PASSED, ${failedCount} FAILED`);
    console.log('======================================================\n');

    testServer.close();
    await disconnectDB();

    if (failedCount > 0) {
      process.exit(1);
    } else {
      process.exit(0);
    }
  } catch (error) {
    console.error('Test execution failed with error:', error);
    if (testServer) testServer.close();
    await disconnectDB();
    process.exit(1);
  }
}

runTests();
