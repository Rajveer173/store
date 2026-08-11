import bcrypt from 'bcryptjs';
import { config, ROLES } from '../config/env.js';
import { pool, closePool, withTransaction } from './index.js';

const DEFAULT_USER_PASSWORD = 'User@12345';
const DEFAULT_OWNER_PASSWORD = 'Owner@12345';

const NORMAL_USERS = [
  {
    name: 'Aarav Sharma Krishnan',
    email: 'aarav.sharma@example.com',
    address: '18 Nehru Cross Road, Bandra West, Mumbai, Maharashtra 400050',
  },
  {
    name: 'Priya Venkatesan Iyer',
    email: 'priya.iyer@example.com',
    address: '204 Lakeview Residency, Indiranagar, Bengaluru, Karnataka 560038',
  },
  {
    name: 'Rohan Bhattacharya Das',
    email: 'rohan.das@example.com',
    address: '7B Salt Lake Sector V, Kolkata, West Bengal 700091',
  },
  {
    name: 'Meera Chandrashekhar Nair',
    email: 'meera.nair@example.com',
    address: '55 Marine Drive Extension, Kochi, Kerala 682011',
  },
  {
    name: 'Vikram Raghunathan Menon',
    email: 'vikram.menon@example.com',
    address: '312 Anna Salai Towers, Chennai, Tamil Nadu 600002',
  },
];

const STORE_OWNERS = [
  {
    name: 'Anil Kumar Deshpande Rao',
    email: 'anil.deshpande@example.com',
    address: '12 Shivaji Nagar Market Lane, Pune, Maharashtra 411005',
  },
  {
    name: 'Sunita Ramachandran Pillai',
    email: 'sunita.pillai@example.com',
    address: '89 Jubilee Hills Road No 3, Hyderabad, Telangana 500033',
  },
  {
    name: 'Farhan Abdul Qureshi Khan',
    email: 'farhan.qureshi@example.com',
    address: '41 Connaught Circus, New Delhi, Delhi 110001',
  },
  {
    name: 'Divya Lakshmi Narayanan',
    email: 'divya.narayanan@example.com',
    address: '26 Ashram Road Riverside, Ahmedabad, Gujarat 380009',
  },
];

const STORES = [
  {
    name: 'Greenfield Organic Marketplace',
    email: 'contact@greenfieldorganic.com',
    address: '15 Hill Road, Bandra West, Mumbai, Maharashtra 400050',
    ownerEmail: 'anil.deshpande@example.com',
  },
  {
    name: 'Riverside Electronics Emporium',
    email: 'support@riversideelectronics.com',
    address: '92 MG Road, Ashok Nagar, Bengaluru, Karnataka 560001',
    ownerEmail: 'sunita.pillai@example.com',
  },
  {
    name: 'Downtown Book And Stationery Hub',
    email: 'hello@downtownbookhub.com',
    address: '3 Park Street Corner, Kolkata, West Bengal 700016',
    ownerEmail: 'farhan.qureshi@example.com',
  },
  {
    name: 'Sunrise Home Furnishing Studio',
    email: 'orders@sunrisefurnishing.com',
    address: '77 Banjara Hills Main Road, Hyderabad, Telangana 500034',
    ownerEmail: 'divya.narayanan@example.com',
  },
  {
    name: 'Metro Fresh Grocery Supercentre',
    email: 'care@metrofreshgrocery.com',
    address: '64 Sardar Patel Marg, Jaipur, Rajasthan 302001',
    ownerEmail: null,
  },
];

const RATINGS = [
  ['aarav.sharma@example.com', 'contact@greenfieldorganic.com', 5],
  ['aarav.sharma@example.com', 'support@riversideelectronics.com', 4],
  ['aarav.sharma@example.com', 'hello@downtownbookhub.com', 3],
  ['priya.iyer@example.com', 'contact@greenfieldorganic.com', 4],
  ['priya.iyer@example.com', 'orders@sunrisefurnishing.com', 5],
  ['rohan.das@example.com', 'contact@greenfieldorganic.com', 3],
  ['rohan.das@example.com', 'support@riversideelectronics.com', 5],
  ['rohan.das@example.com', 'care@metrofreshgrocery.com', 4],
  ['meera.nair@example.com', 'hello@downtownbookhub.com', 5],
  ['meera.nair@example.com', 'orders@sunrisefurnishing.com', 2],
  ['vikram.menon@example.com', 'support@riversideelectronics.com', 4],
  ['vikram.menon@example.com', 'care@metrofreshgrocery.com', 3],
  ['vikram.menon@example.com', 'contact@greenfieldorganic.com', 4],
];

async function upsertUser(client, { name, email, address, role, password }) {
  const passwordHash = await bcrypt.hash(password, config.bcryptRounds);
  const { rows } = await client.query(
    `INSERT INTO users (name, email, password_hash, address, role)
     VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT (email) DO UPDATE
       SET name = EXCLUDED.name,
           password_hash = EXCLUDED.password_hash,
           address = EXCLUDED.address,
           role = EXCLUDED.role
     RETURNING id, email`,
    [name, email, passwordHash, address, role],
  );
  return rows[0];
}

async function run() {
  await withTransaction(async (client) => {
    const userIdByEmail = new Map();

    const admin = await upsertUser(client, {
      name: 'System Administrator Account',
      email: config.seedAdminEmail,
      address: 'Platform Operations Office, 1 Enterprise Park, Pune, Maharashtra 411014',
      role: ROLES.ADMIN,
      password: config.seedAdminPassword,
    });
    userIdByEmail.set(admin.email.toLowerCase(), admin.id);

    for (const user of NORMAL_USERS) {
      const row = await upsertUser(client, {
        ...user,
        role: ROLES.USER,
        password: DEFAULT_USER_PASSWORD,
      });
      userIdByEmail.set(row.email.toLowerCase(), row.id);
    }

    for (const owner of STORE_OWNERS) {
      const row = await upsertUser(client, {
        ...owner,
        role: ROLES.OWNER,
        password: DEFAULT_OWNER_PASSWORD,
      });
      userIdByEmail.set(row.email.toLowerCase(), row.id);
    }

    const storeIdByEmail = new Map();
    for (const store of STORES) {
      const ownerId = store.ownerEmail ? userIdByEmail.get(store.ownerEmail) : null;
      const { rows } = await client.query(
        `INSERT INTO stores (name, email, address, owner_id)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (email) DO UPDATE
           SET name = EXCLUDED.name,
               address = EXCLUDED.address,
               owner_id = EXCLUDED.owner_id
         RETURNING id, email`,
        [store.name, store.email, store.address, ownerId ?? null],
      );
      storeIdByEmail.set(rows[0].email.toLowerCase(), rows[0].id);
    }

    for (const [userEmail, storeEmail, score] of RATINGS) {
      await client.query(
        `INSERT INTO ratings (user_id, store_id, score)
         VALUES ($1, $2, $3)
         ON CONFLICT (user_id, store_id) DO UPDATE SET score = EXCLUDED.score`,
        [userIdByEmail.get(userEmail), storeIdByEmail.get(storeEmail), score],
      );
    }
  });

  const counts = await pool.query(
    `SELECT
       (SELECT COUNT(*) FROM users)   AS users,
       (SELECT COUNT(*) FROM stores)  AS stores,
       (SELECT COUNT(*) FROM ratings) AS ratings`,
  );
  const { users, stores, ratings } = counts.rows[0];
  process.stdout.write(`Seed completed: ${users} users, ${stores} stores, ${ratings} ratings\n`);
  process.stdout.write(`Admin login: ${config.seedAdminEmail} / ${config.seedAdminPassword}\n`);
  process.stdout.write(`Normal user login: ${NORMAL_USERS[0].email} / ${DEFAULT_USER_PASSWORD}\n`);
  process.stdout.write(`Store owner login: ${STORE_OWNERS[0].email} / ${DEFAULT_OWNER_PASSWORD}\n`);
}

run()
  .catch((error) => {
    process.stderr.write(`Seed failed: ${error.message}\n`);
    process.exitCode = 1;
  })
  .finally(closePool);
