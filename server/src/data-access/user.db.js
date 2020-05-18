
import Id from '../Id';
import bcrypt from 'bcryptjs';

export default function makeUserDb ({ makeDb, }) {
  return Object.freeze({
    findAll,
    insert,
    findByHash,
    findByEmail,
    findByCredentials,
  });

  async function findAll () {
    const db = await makeDb();
    const result = await db.collection('users').findAll({});
  }

  async function insert ({ id: _id = Id.makeId(), ...userInfo }) {
    const db = await makeDb();
    const { password, } = userInfo;
    userInfo.password = await bcrypt.hash(password, 8);
    const result = await db.collection('users').insertOne({ _id, ...userInfo, });
    const { _id: id, ...insertedInfo } = result.ops[0];
    return { id, ...insertedInfo, };
  }

  async function findByHash (user) {
    const db = await makeDb();
    const result = await db.collection('users').find({ hash: user.hash, });
    const found = await result.toArray();
    if (found.length === 0) {
      return null;
    }
    const { _id: id, ...insertedInfo } = found[0];
    return { id, ...insertedInfo, };
  }

  async function findByEmail ({ email, }) {
    const db = await makeDb();
    const result = await db.collection('users').find({ email, });
    const found = await result.toArray();
    if (found.length === 0) {
      return null;
    }
    const { _id: id, ...insertedInfo } = found[0];
    return { id, ...insertedInfo, };
  }

  async function findByCredentials ({ email, password, }) {
    const db = await makeDb();
    const found = await db.collection('users').findOne({ email, });
    if (!found) {
      return null;
    }
    const { _id: id, ...user } = found;
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (isPasswordMatch) {
      return { id, ...user, };
    }
    throw new Error(' Wrong password for the email ', email);
  }
}
