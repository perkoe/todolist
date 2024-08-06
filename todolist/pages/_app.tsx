import type { AppProps } from "next/app";
import { useState, useEffect } from "react";
import {
    Button,
    ChakraProvider,
    Flex,
    Text,
    Input,
    Checkbox,
    IconButton,
    Box,
    Progress,
} from "@chakra-ui/react";
import { DeleteIcon, EditIcon } from "@chakra-ui/icons";
import { ref, set, push, onValue, update, remove, get } from "firebase/database";
import { db } from "./config/firebaseConfig";

interface Task {
    id: string;
    text: string;
    isChecked: boolean;
}

export default function App({ Component, pageProps }: AppProps) {
    const [newTask, setNewTask] = useState<string>("");
    const [tasks, setTasks] = useState<Task[]>([]);

    useEffect(() => {
        const tasksRef = ref(db, "tasks");
        onValue(tasksRef, (snapshot) => {
            const data = snapshot.val();
            const tasksList = data
                ? Object.keys(data).map((key) => ({ id: key, ...data[key] }))
                : [];
            setTasks(tasksList);
        });
    }, []);

    const addTask = async (e: React.FormEvent) => {
        e.preventDefault();

        if (newTask.trim()) {
            const tasksRef = ref(db, "tasks");
            const newTaskRef = push(tasksRef);
            await set(newTaskRef, {
                text: newTask.trim(),
                isChecked: false,
            });
            setNewTask("");
        }
    };

    const updateTaskStatus = async (id: string, isChecked: boolean) => {
        const taskRef = ref(db, `tasks/${id}`);
        await update(taskRef, { isChecked });

        setTasks((prevTasks) =>
            prevTasks.map((task) =>
                task.id === id ? { ...task, isChecked } : task
            )
        );
    };

    const removeTask = async (id: string) => {
        const taskRef = ref(db, `tasks/${id}`);
        const taskSnapshot = await get(taskRef);
        const taskData = taskSnapshot.val();

        if (taskData) {
            const deletedTasksRef = ref(db, `deletedTasks/${id}`);
            await set(deletedTasksRef, taskData);
            await remove(taskRef);

            setTasks((prevTasks) => prevTasks.filter((task) => task.id !== id));
        }
    };

    const completedTasksCount = tasks.filter((task) => task.isChecked).length;
    const totalTasksCount = tasks.length;
    const completionRatio =
        totalTasksCount === 0 ? 0 : (completedTasksCount / totalTasksCount) * 100;

    return (
        <ChakraProvider>
            <Flex w="100%" h="100vh" alignItems="center" justifyContent="center">
                <Flex
                    w="60%"
                    flexDir="column"
                    p={5}
                    boxShadow="md"
                    borderRadius="md"
                    bg="white"
                >
                    <Text fontWeight="bold" fontSize="2xl" mb={5}>
                        To Do List
                    </Text>
                    <form onSubmit={addTask}>
                        <Flex>
                            <Input
                                value={newTask}
                                onChange={(e) => setNewTask(e.target.value)}
                                variant="flushed"
                                placeholder="Add Task"
                                w="80%"
                                mr={3}
                            />
                            <Button type="submit" bg="blue.500" color="white">
                                Add Task
                            </Button>
                        </Flex>
                    </form>

                    <Box mt={5}>
                        {tasks
                            .sort((a, b) => Number(a.isChecked) - Number(b.isChecked))
                            .map((task) => (
                                <TaskItem
                                    key={task.id}
                                    task={task}
                                    updateTaskStatus={updateTaskStatus}
                                    removeTask={removeTask}
                                />
                            ))}
                    </Box>

                    <Text mt={5} mb={2}>
                        Progress
                    </Text>
                    <Progress
                        value={completionRatio}
                        size="lg"
                        colorScheme="green"
                        mb={5}
                    />
                </Flex>
            </Flex>
        </ChakraProvider>
    );
}

const TaskItem = ({
                      task,
                      updateTaskStatus,
                      removeTask,
                  }: {
    task: Task;
    updateTaskStatus: (id: string, isChecked: boolean) => void;
    removeTask: (id: string) => void;
}) => {
    return (
        <Flex
            alignItems="center"
            justifyContent="space-between"
            mb={3}
            p={2}
            borderRadius="md"
            bg={task.isChecked ? "gray.100" : "white"}
            textDecoration={task.isChecked ? "line-through" : "none"}
            color={task.isChecked ? "gray.500" : "black"}
        >
            <Checkbox
                isChecked={task.isChecked}
                onChange={(e) => updateTaskStatus(task.id, e.target.checked)}
                colorScheme="green"
                flexGrow={1}
            >
                <Text ml={2}>{task.text}</Text>
            </Checkbox>
            <IconButton
                onClick={() => removeTask(task.id)}
                bg="red.500"
                color="white"
                aria-label="Delete task"
                icon={<DeleteIcon />}
                ml={3}
            />
        </Flex>
    );
};
