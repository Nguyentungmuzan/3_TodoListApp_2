import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Button, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import * as SQLite from 'expo-sqlite';

const openDatabase = async () => {
  const db = await SQLite.openDatabaseAsync('tasks.db');
  return db;
};

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [taskName, setTaskName] = useState('');
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    const initDB = async () => {
      const db = await openDatabase();
      await db.execAsync(
        'CREATE TABLE IF NOT EXISTS tasks (id INTEGER PRIMARY KEY AUTOINCREMENT, taskName TEXT, isCompleted INT);'
      );
      fetchTasks();
    };

    initDB();
  }, []);

  const fetchTasks = async () => {
    const db = await openDatabase();
    const result = await db.getAllAsync('SELECT * FROM tasks');
    setTasks(result);
  };

  const handleAddOrEditTask = async () => {
    const db = await openDatabase();
    if (editId !== null) {
      await db.runAsync(
        'UPDATE tasks SET taskName = ? WHERE id = ?;',
        [taskName, editId]
      );
      setEditId(null);
    } else {
      await db.runAsync(
        'INSERT INTO tasks (taskName, isCompleted) VALUES (?, 0);',
        [taskName]
      );
    }
    setTaskName('');
    fetchTasks();
  };

  const handleDeleteTask = async (id) => {
    const db = await openDatabase();
    await db.runAsync('DELETE FROM tasks WHERE id = ?;', [id]);
    fetchTasks();
  };

  const handleEditTask = (id, taskName) => {
    setTaskName(taskName);
    setEditId(id);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Todo List</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter task"
        value={taskName}
        onChangeText={setTaskName}
      />
      <Button title={editId !== null ? "Update Task" : "Add Task"} onPress={handleAddOrEditTask} />
      <FlatList
        data={tasks}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.taskItem}>
            <Text style={styles.taskText}>{item.taskName}</Text>
            <TouchableOpacity onPress={() => handleEditTask(item.id, item.taskName)} style={styles.editButton}>
              <Text style={styles.buttonText}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleDeleteTask(item.id)} style={styles.deleteButton}>
              <Text style={styles.buttonText}>Delete</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
  },
  taskItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    padding: 10,
    borderWidth: 1,
    borderRadius: 5,
    borderColor: '#ccc',
  },
  taskText: {
    flex: 1,
    fontSize: 16,
  },
  editButton: {
    marginHorizontal: 10,
    backgroundColor: '#ffc107',
    padding: 5,
    borderRadius: 5,
  },
  deleteButton: {
    backgroundColor: '#dc3545',
    padding: 5,
    borderRadius: 5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
  },
});
