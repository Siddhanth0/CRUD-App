import { Text, View, TextInput, Pressable, StyleSheet, FlatList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState, useContext, useEffect } from "react";
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { ThemeContext } from "../context/ThemeContext";

import { data } from "@/data/todos"
import { useRouter } from "expo-router";
import { Inter_500Medium, useFonts } from "@expo-google-fonts/inter";
import Animated, {LinearTransition} from 'react-native-reanimated';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { StatusBar } from "expo-status-bar";


import Octicons from '@expo/vector-icons/Octicons'

export default function Index() {
  const [todos, setTodos] = useState([])
  const [text, setText] = useState('')
  const router = useRouter()

  const [loaded, error] = useFonts({
    Inter_500Medium,
  })

  const { colorScheme, setColorScheme, theme} = useContext(ThemeContext)

  useEffect(() => {
        const loadThemeFromStorage = async () => {
            const storedTheme = await AsyncStorage.getItem("colorScheme");
            if (storedTheme) setColorScheme(storedTheme);
        }
        loadThemeFromStorage()
    }, [])
  
  useEffect(() => {
    const fetchData = async() => {
      try {
        const jsonvalue = await AsyncStorage.getItem("TodoApp")
        const storageTodos = jsonvalue != null ? JSON.parse(jsonvalue) : null

        if(storageTodos && storageTodos.length) {
          setTodos(storageTodos.sort((a,b) => b.id - a.id))
        } else {
          setTodos(data.sort((a,b) => b.id - a.id))
        }
      } catch(e) {
        console.error(e)
      }
    }
    fetchData()
  }, [data])

  useEffect(() => {
    const storaData = async () => {
      try {
        const jsonvalue = JSON.stringify(todos)
        await AsyncStorage.setItem("TodoApp", jsonvalue)
      } catch (e) {
        console.error(e)
      }
    }
    storaData()
  }, [todos])
  

  if(!loaded && !error) {
    return null
  }

  const styles = createStyles(theme, colorScheme)

  const addTodo = () => {
    if (text.trim()) {
      const newId = todos.length > 0 ? todos[0].id + 1 : 1;
      setTodos([{ id: newId, title: text, completed: false }, ...todos])
      setText('')
    }
  }

  const toggleTodo = (id) => {
    setTodos(todos.map(todo => todo.id === id ? { ...todo, completed: !todo.completed } : todo))
  }

  const removeTodo = (id) => {
    setTodos(todos.filter(todo => todo.id !== id))
  }

  const handlePress = (id) => {
    router.push(`/todos/${id}`)
  }

  const renderItem = ({ item }) => (
    <View style={styles.todoItem}>
      <Pressable 
        onPress={() => handlePress(item.id)}
        onLongPress={() => toggleTodo(item.id)}
        style={{flex: 1}}>
        <Text style={[styles.todoText, item.completed && styles.completedText]} numberOfLines={1} ellipsizeMode="tail">
          {item.title}
        </Text>
      </Pressable>
      <Pressable onPress={() => removeTodo(item.id)}>
        <MaterialCommunityIcons name="delete-outline" size={36} color="red" selectable={undefined} />
      </Pressable>
    </View>
  )

  const toggleTheme = async () => {
        const newScheme = colorScheme === "light" ? "dark" : "light";
        await AsyncStorage.setItem("colorScheme", newScheme);
        setColorScheme(newScheme);
    };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Add a new todo"
          placeholderTextColor="gray"
          value={text}
          onChangeText={setText}
        />
        <Pressable onPress={addTodo} style={styles.addButton}>
          <Text style={styles.addButtonText}>Add</Text>
        </Pressable>
        <Pressable onPress={toggleTheme} style= {{marginLeft: 10}}>
          {colorScheme === 'dark' 
          ? <Octicons name="moon" size={36} color={theme.text} selectable={undefined} style= {{width: 36}}/> 
          : <Octicons name="sun" size={36} color={theme.text} selectable={undefined} style= {{width: 36}}/> }
        </Pressable>
      </View>
      <Animated.FlatList
        data={todos}
        renderItem={renderItem}
        keyExtractor={todo => todo.id}
        contentContainerStyle={{ flexGrow: 1 }}
        itemLayoutAnimation={LinearTransition}
        keyboardDismissMode= "on-drag"
      />
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'}/>
    </SafeAreaView>
  );
}

function createStyles(theme, colorScheme){
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    inputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 10,
      padding: 10,
      width: '100%',
      maxWidth: 1024,
      marginHorizontal: 'auto',
      pointerEvents: 'auto',
    },
    input: {
      flex: 1,
      borderColor: 'gray',
      borderWidth: 1,
      borderRadius: 5,
      padding: 10,
      marginRight: 10,
      fontSize: 18,
      fontFamily: 'Inter_500Medium',
      minWidth: 0,
      color: theme.text,
    },
    addButton: {
      backgroundColor: theme.button,
      borderRadius: 5,
      padding: 10,
    },
    addButtonText: {
      fontSize: 18,
      color: colorScheme === 'dark' ? 'black' : 'white',
    },
    todoItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 4,
      padding: 10,
      borderBottomColor: 'gray',
      borderBottomWidth: 1,
      width: '100%',
      maxWidth: 1024,
      marginHorizontal: 'auto',
      pointerEvents: 'auto',
    },
    todoText: {
      maxWidth: '90%',
      fontSize: 18,
      fontFamily: 'Inter_500Medium',
      color: theme.text,
    },
    completedText: {
      textDecorationLine: 'line-through',
      color: 'gray',
    }
  })
}