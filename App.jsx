import { useEffect, useState } from 'react';
import './styles.css';
// import './App.css';
import { db } from '../firebase.ts';
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
} from 'firebase/firestore';

function App() {
  const [menuItems, setMenuItems] = useState([]);
  const [newItem, setNewItem] = useState({ name: '', price: '' });

  const menuRef = collection(db, 'menu');

  // items from firestore
  const fetchMenu = async () => {
    const snapshot = await getDocs(menuRef);
    const items = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
    setMenuItems(items);
  };

  // create new item
  const handleAddItem = async (e) => {
    e.preventDefault();
    if (!newItem.name || isNaN(newItem.price)) return;

    await addDoc(menuRef, {
      name: newItem.name.trim(),
      price: parseFloat(newItem.price),
    });
    setNewItem({ name: '', price: '' });
    fetchMenu();
  };

  // update item price
  const handleEdit = async (item) => {
    const newPrice = parseFloat(prompt(`Enter new price for ${item.name}:`, item.price));
    if (!isNaN(newPrice)) {
      const itemRef = doc(db, 'menu', item.id);
      await updateDoc(itemRef, { price: newPrice });
      fetchMenu();
    } else {
      alert('Invalid price.');
    }
  };

  // delete item
  const handleDelete = async (itemId) => {
    const confirmDelete = confirm('Are you sure you want to delete this item?');
    if (confirmDelete) {
      await deleteDoc(doc(db, 'menu', itemId));
      fetchMenu();
    }
  };

  useEffect(() => {
    fetchMenu();
  }, []);

  return (
    <div className="main">
      <h1>☕ Create a Cafe Menu!</h1>

      <form onSubmit={handleAddItem}>
        <input
          type="text"
          placeholder="Item name"
          value={newItem.name}
          onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
          required
        />
        <input
          type="number"
          step="0.01"
          placeholder="Price"
          value={newItem.price}
          onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
          required
        />
        <button type="submit">Add Item</button>
      </form>

      <div className="list">
        <h3><u>Cafe Menu</u></h3>
        <ul>
          {menuItems.map(item => (
            <li key={item.id}>
              <b>{item.name}</b> - ${parseFloat(item.price).toFixed(2)}{' '}
              <button onClick={() => handleEdit(item)}>Edit</button>{' '}
              <button onClick={() => handleDelete(item.id)}>Delete</button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default App;
