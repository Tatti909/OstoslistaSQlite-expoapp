import { TextInput, View, Button, FlatList, Text, StyleSheet } from 'react-native';
import { useEffect, useState } from 'react';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import * as SQLite from 'expo-sqlite';



const db = SQLite.openDatabaseSync('shoppingdb');

export default function App() {

  const [product, setProduct] = useState('');
  const [amount, setAmount] = useState('');
  const [items, setItems] = useState([]);

  const initialize = async () => {
    try {
      db.execSync(`
        CREATE TABLE IF NOT EXISTS shopping (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          product TEXT,
          amount TEXT
        );
      `);
      updateList();
    } catch (err) {
      console.error('Could not open database', err);
    }
  };

  const saveItem = async () => {
  try {
    await db.runAsync(
      'INSERT INTO shopping (product, amount) VALUES (?, ?)',
      product,
      amount
    );
    setProduct('');
    setAmount('');
    await updateList();
  } catch (err) {
    console.error('Could not save item', err);
  }
};

  const updateList = async () => {
    try {
      const list = await db.getAllAsync('SELECT * FROM shopping ORDER BY id DESC');
      setItems(list);
    } catch (err) {
      console.error('Could not get items', err);
    }
  }

  const deleteItem = async id => {
    try {
      await db.runAsync('DELETE FROM shopping WHERE id = ?', id);
      await updateList();
    } catch (err) {
      console.error('Could not delete item', err);
    }
  }

  useEffect(() => { initialize() }, []);

  return (
    <SafeAreaProvider>
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
      <TextInput
        placeholder='Product'
        onChangeText={product => setProduct(product)}
        value={product}
      />
      <TextInput
        placeholder='Amount'
        onChangeText={amount => setAmount(amount)}
        value={amount}
      />
      <Button onPress={saveItem} title='Save' />

      <Text>Shopping List</Text>

      <FlatList
        data={items}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => (
          <View>
            <Text>
              {item.product}, {item.amount}{' '}
              <Text onPress={() => deleteItem(item.id)}>bought</Text>
            </Text>
          </View>
        )}
      />
    </SafeAreaView>
    </SafeAreaProvider>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
