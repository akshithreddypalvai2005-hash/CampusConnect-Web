const dotenv = require('dotenv');
dotenv.config();

const mongoose = require('mongoose');
const { connectDB, disconnectDB } = require('../src/config/db');
const User = require('../src/models/User');
const Item = require('../src/models/Item');
const Claim = require('../src/models/Claim');
const Notification = require('../src/models/Notification');
const ReportFlag = require('../src/models/ReportFlag');
const AuditLog = require('../src/models/AuditLog');
const Category = require('../src/models/Category');
const CampusLocation = require('../src/models/CampusLocation');

async function seedDatabase() {
  try {
    console.log('[Seed] Connecting to database...');
    await connectDB();

    console.log('[Seed] Clearing existing collections for fresh seed data...');
    await Promise.all([
      User.deleteMany({}),
      Item.deleteMany({}),
      Claim.deleteMany({}),
      Notification.deleteMany({}),
      ReportFlag.deleteMany({}),
      AuditLog.deleteMany({}),
      Category.deleteMany({}),
      CampusLocation.deleteMany({}),
    ]);

    console.log('[Seed] Seeding categories...');
    const categories = await Category.insertMany([
      { name: 'Electronics', description: 'Laptops, phones, headphones, chargers, power banks', icon: 'Laptop' },
      { name: 'ID & Cards', description: 'College ID cards, library cards, ATM/debit cards, driver licenses', icon: 'CreditCard' },
      { name: 'Books & Stationery', description: 'Textbooks, notebooks, calculators, lab records, pencil pouches', icon: 'BookOpen' },
      { name: 'Bags & Wallets', description: 'Backpacks, wallets, coin purses, gym bags', icon: 'Briefcase' },
      { name: 'Keys', description: 'Room keys, bike/scooter keys, locker keys, keychains', icon: 'Key' },
      { name: 'Personal Accessories', description: 'Watches, eyeglasses, rings, jewellery, caps', icon: 'Watch' },
      { name: 'Bottles & Flasks', description: 'Water bottles, thermos flasks, sippers', icon: 'Coffee' },
      { name: 'Others', description: 'Umbrellas, jackets, sports gear, musical instruments', icon: 'HelpCircle' },
    ]);

    console.log('[Seed] Seeding campus locations...');
    const locations = await CampusLocation.insertMany([
      { name: 'Central Library - Reading Room', zone: 'Academic Zone' },
      { name: 'Central Library - 2nd Floor Stacks', zone: 'Academic Zone' },
      { name: 'Main Cafeteria & Food Court', zone: 'Student Activity Zone' },
      { name: 'Computer Lab 3 - Block B', zone: 'Academic Zone' },
      { name: 'Auditorium Complex', zone: 'Cultural Zone' },
      { name: 'Sports Complex & Gymnasium', zone: 'Sports Zone' },
      { name: 'Mechanical Workshop Hall', zone: 'Engineering Block' },
      { name: 'Admin Building - Ground Floor', zone: 'Administrative Zone' },
      { name: 'Campus Bus Stop / Gate 1', zone: 'Transit Zone' },
      { name: 'Hostel Block A Lawn', zone: 'Residential Zone' },
    ]);

    console.log('[Seed] Seeding users with hashed passwords...');
    const adminPasswordHash = await User.hashPassword(process.env.INITIAL_ADMIN_PASSWORD || 'Admin@Campus2026!');
    const studentPasswordHash = await User.hashPassword('Student@1234');

    const adminUser = await User.create({
      name: process.env.INITIAL_ADMIN_NAME || 'Campus System Administrator',
      email: (process.env.INITIAL_ADMIN_EMAIL || 'admin@campusconnect.edu.in').toLowerCase(),
      studentId: process.env.INITIAL_ADMIN_STUDENT_ID || 'ADMIN-001',
      department: 'Computer Science & Engineering',
      yearOfStudy: 'Faculty/Staff',
      passwordHash: adminPasswordHash,
      role: 'admin',
      accountStatus: 'active',
      phone: '+91 98765 43210',
    });

    const student1 = await User.create({
      name: 'Rahul Sharma',
      email: 'rahul.sharma@campusconnect.edu.in',
      studentId: '22CS1045',
      department: 'Computer Science & Engineering',
      yearOfStudy: '3rd Year',
      passwordHash: studentPasswordHash,
      role: 'student',
      accountStatus: 'active',
      phone: '+91 98111 22334',
    });

    const student2 = await User.create({
      name: 'Priya Patel',
      email: 'priya.patel@campusconnect.edu.in',
      studentId: '23EC2018',
      department: 'Electronics & Communication',
      yearOfStudy: '2nd Year',
      passwordHash: studentPasswordHash,
      role: 'student',
      accountStatus: 'active',
      phone: '+91 98222 33445',
    });

    const student3 = await User.create({
      name: 'Ananya Sen',
      email: 'ananya.sen@campusconnect.edu.in',
      studentId: '21ME3012',
      department: 'Mechanical Engineering',
      yearOfStudy: '4th Year',
      passwordHash: studentPasswordHash,
      role: 'student',
      accountStatus: 'active',
      phone: '+91 98333 44556',
    });

    console.log('[Seed] Seeding items...');
    const item1 = await Item.create({
      title: 'College ID Card (CSE Department)',
      description: 'Official student identity card belonging to Rahul Sharma in a maroon departmental lanyard. Lost during the afternoon study session.',
      category: 'ID & Cards',
      reportType: 'lost',
      approximateLocation: 'Central Library - Reading Room',
      eventDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      images: [],
      status: 'open',
      custodyStatus: 'not_applicable',
      owner: student1._id,
      moderationStatus: 'approved',
      identifyingCharacteristics: 'Roll No 22CS1045 visible on front, has a barcode sticker on back.',
      contactPreference: 'in_app',
    });

    const item2 = await Item.create({
      title: 'boAt Rockerz 550 Wireless Headphones',
      description: 'Matte black over-ear Bluetooth headphones discovered resting on Table 14 in the cafeteria after lunch.',
      category: 'Electronics',
      reportType: 'found',
      approximateLocation: 'Main Cafeteria & Food Court',
      eventDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      images: [],
      status: 'open',
      custodyStatus: 'held_by_finder',
      owner: student2._id,
      moderationStatus: 'approved',
      identifyingCharacteristics: 'Has a small metallic scratch near the left hinge and custom bass sticker.',
      contactPreference: 'in_app',
    });

    const item3 = await Item.create({
      title: 'Casio Scientific Calculator fx-991EX',
      description: 'Black scientific calculator in original slide-on cover. Left behind during the morning Digital Electronics lab practical.',
      category: 'Books & Stationery',
      reportType: 'lost',
      approximateLocation: 'Computer Lab 3 - Block B',
      eventDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      images: [],
      status: 'open',
      custodyStatus: 'not_applicable',
      owner: student2._id,
      moderationStatus: 'approved',
      identifyingCharacteristics: 'Initials "PP" written with silver permanent marker inside slide cover.',
      contactPreference: 'in_app',
    });

    const item4 = await Item.create({
      title: 'Milton 1000ml Blue Insulated Flask',
      description: 'Royal blue stainless steel thermos water bottle found near Court 2 after evening badminton practice.',
      category: 'Bottles & Flasks',
      reportType: 'found',
      approximateLocation: 'Sports Complex & Gymnasium',
      eventDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
      images: [],
      status: 'open',
      custodyStatus: 'campus_office',
      owner: student3._id,
      moderationStatus: 'approved',
      identifyingCharacteristics: 'Dented at the bottom rim, has an anime sticker on lid.',
      contactPreference: 'office_handover',
    });

    const item5 = await Item.create({
      title: 'Lenovo 65W USB-C Laptop Charger',
      description: 'Original black Lenovo ThinkPad Type-C fast charger. Handed over back to rightful owner through campus verification office.',
      category: 'Electronics',
      reportType: 'found',
      approximateLocation: 'Auditorium Complex',
      eventDate: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
      images: [],
      status: 'recovered',
      custodyStatus: 'campus_office',
      owner: student1._id,
      claimedBy: student3._id,
      recoveredAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      moderationStatus: 'approved',
      identifyingCharacteristics: 'Serial ending in -9841.',
      contactPreference: 'office_handover',
    });

    const item6 = await Item.create({
      title: 'Brown Wildhorn Leather Wallet',
      description: 'Dark brown bi-fold wallet lost while heading towards administrative building for scholarship document submission.',
      category: 'Bags & Wallets',
      reportType: 'lost',
      approximateLocation: 'Admin Building - Ground Floor',
      eventDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      images: [],
      status: 'open',
      custodyStatus: 'not_applicable',
      owner: student3._id,
      moderationStatus: 'approved',
      identifyingCharacteristics: 'Contains student metro card and receipt for exam fees.',
      contactPreference: 'in_app',
    });

    console.log('[Seed] Seeding ownership claims...');
    // A pending claim submitted by Rahul for the found headphones
    const claim1 = await Claim.create({
      item: item2._id,
      claimant: student1._id,
      explanation: 'I misplaced my black boAt Rockerz headphones during lunch yesterday at Cafeteria Table 14. I can provide the Amazon purchase invoice and show pairing history on my smartphone.',
      privateEvidence: {
        description: 'Bluetooth MAC address ending in 4F:2A. Contains Amazon digital invoice from October 2025.',
        secretIdentifiers: 'Left ear cup cushioning has a slight indentation. Device name saved as "Rahul Rockerz".',
        purchaseOrReceiptDetails: 'Order ID: 403-9182371-2918231',
        evidenceImages: [],
      },
      status: 'pending',
    });

    // An approved claim for item5
    const claim2 = await Claim.create({
      item: item5._id,
      claimant: student3._id,
      explanation: 'I left my Lenovo charger in the auditorium green room during the orientation rehearsal. I brought my laptop to test match.',
      privateEvidence: {
        description: 'Tested charging speed with student laptop on site.',
        secretIdentifiers: 'Serial number verified against student laptop box invoice.',
        purchaseOrReceiptDetails: 'College laptop grant receipt #2024-ME',
      },
      status: 'approved',
      reviewedBy: adminUser._id,
      reviewNotes: 'Physical handover completed at Lost & Found desk. Serial number matched with laptop battery spec.',
      reviewedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      handoverConfirmedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    });

    console.log('[Seed] Seeding audit logs...');
    await AuditLog.insertMany([
      {
        actor: adminUser._id,
        action: 'SYSTEM_INITIALIZED',
        targetType: 'System',
        targetId: 'INIT',
        relevantMetadata: { version: '1.0.0', campus: 'Engineering Campus' },
      },
      {
        actor: student1._id,
        action: 'ITEM_CREATED',
        targetType: 'Item',
        targetId: item1._id,
        relevantMetadata: { title: item1.title, type: item1.reportType },
      },
      {
        actor: student2._id,
        action: 'ITEM_CREATED',
        targetType: 'Item',
        targetId: item2._id,
        relevantMetadata: { title: item2.title, type: item2.reportType },
      },
      {
        actor: student1._id,
        action: 'CLAIM_SUBMITTED',
        targetType: 'Claim',
        targetId: claim1._id,
        relevantMetadata: { itemTitle: item2.title },
      },
      {
        actor: adminUser._id,
        action: 'CLAIM_APPROVED',
        targetType: 'Claim',
        targetId: claim2._id,
        relevantMetadata: { itemTitle: item5.title, claimantName: student3.name },
      },
    ]);

    console.log('[Seed] Seeding notifications...');
    await Notification.insertMany([
      {
        recipient: student1._id,
        type: 'system',
        message: 'Welcome to CampusConnect! Browse recent reports or file a lost item claim at any time.',
      },
      {
        recipient: student2._id,
        type: 'claim_submitted',
        message: `New Ownership Claim: A student submitted an ownership claim for your found report "${item2.title}". Campus administration is reviewing the evidence.`,
        relatedItem: item2._id,
        relatedClaim: claim1._id,
      },
      {
        recipient: student1._id,
        type: 'system',
        message: `Your ownership claim for "${item2.title}" was registered and is currently pending administrator verification.`,
        relatedItem: item2._id,
        relatedClaim: claim1._id,
      },
      {
        recipient: student3._id,
        type: 'claim_approved',
        message: `Your ownership claim for "${item5.title}" was APPROVED. Item handover successfully confirmed!`,
        relatedItem: item5._id,
        relatedClaim: claim2._id,
        readAt: new Date(),
      },
    ]);

    console.log('\n======================================================');
    console.log('✅ DATABASE SEEDING COMPLETED SUCCESSFULLY!');
    console.log('======================================================');
    console.log('🎓 DEMO ACCOUNTS FOR VIVA & TESTING:');
    console.log('------------------------------------------------------');
    console.log('🔑 ADMINISTRATOR:');
    console.log(`   Email:    ${adminUser.email}`);
    console.log(`   Password: ${process.env.INITIAL_ADMIN_PASSWORD || 'Admin@Campus2026!'}`);
    console.log(`   Role:     admin (full moderation & audit permissions)`);
    console.log('------------------------------------------------------');
    console.log('👤 STUDENT 1:');
    console.log(`   Email:    rahul.sharma@campusconnect.edu.in`);
    console.log(`   Password: Student@1234`);
    console.log(`   Info:     3rd Year CSE, Lost ID card, Claimed Headphones`);
    console.log('------------------------------------------------------');
    console.log('👤 STUDENT 2:');
    console.log(`   Email:    priya.patel@campusconnect.edu.in`);
    console.log(`   Password: Student@1234`);
    console.log(`   Info:     2nd Year ECE, Found Headphones, Lost Calculator`);
    console.log('------------------------------------------------------');
    console.log('👤 STUDENT 3:');
    console.log(`   Email:    ananya.sen@campusconnect.edu.in`);
    console.log(`   Password: Student@1234`);
    console.log(`   Info:     4th Year ME, Recovered Charger, Lost Wallet`);
    console.log('======================================================\n');

    await disconnectDB();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during seeding:', error);
    process.exit(1);
  }
}

seedDatabase();
