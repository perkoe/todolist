import type { AppProps } from "next/app";
import { useState } from "react";
import {
    Button,
    ChakraProvider,
    Flex,
    Text,
    Input,
    Checkbox,
    IconButton,
    Box,
    Progress
} from "@chakra-ui/react";
import {DeleteIcon, EditIcon} from "@chakra-ui/icons";

export default function App({ Component, pageProps }: AppProps) {
    const [newTask, setNewTask] = useState<string>("");
    const [tasks, setTasks] = useState<{ text: string; isChecked: boolean }[]>([]);

    const addTask = (e: React.FormEvent) => {
        e.preventDefault();

        if (newTask.trim()) {
            setTasks((prevTasks) => [
                ...prevTasks,
                { text: newTask.trim(), isChecked: false }
            ]);
            setNewTask("");
        }
    };

    const updateTaskStatus = (index: number, isChecked: boolean) => {
        setTasks((prevTasks) =>
            prevTasks.map((task, i) =>
                i === index ? { ...task, isChecked } : task
            )
        );
    };

    const removeTask = (index: number) => {
        setTasks((prevTasks) => prevTasks.filter((_, i) => i !== index));
    };

    const completedTasksCount = tasks.filter(task => task.isChecked).length;
    const totalTasksCount = tasks.length;
    const completionRatio = totalTasksCount === 0 ? 0 : (completedTasksCount / totalTasksCount) * 100;

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
                            .map((task, index) => (
                                <TaskItem
                                    key={index}
                                    task={task}
                                    index={index}
                                    updateTaskStatus={updateTaskStatus}
                                    removeTask={removeTask}
                                />
                            ))}
                    </Box>

                    <Text mt={5} mb={2}>Progress</Text>
                    <Progress value={completionRatio} size="lg" colorScheme="green" mb={5} />
                </Flex>
            </Flex>
        </ChakraProvider>
    );
}

const TaskItem = ({
                      task,
                      index,
                      updateTaskStatus,
                      removeTask
                  }: {
    task: { text: string; isChecked: boolean };
    index: number;
    updateTaskStatus: (index: number, isChecked: boolean) => void;
    removeTask: (index: number) => void;
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
                onChange={(e) => updateTaskStatus(index, e.target.checked)}
                colorScheme="green"
                flexGrow={1}
            >
                <Text ml={2}>{task.text}</Text>
            </Checkbox>
            <IconButton
                onClick={() => removeTask(index)}
                bg="green.500"
                color="white"
                aria-label="Edit task"
                icon={<EditIcon />}
                ml={3}
            />
            <IconButton
                onClick={() => removeTask(index)}
                bg="red.500"
                color="white"
                aria-label="Delete task"
                icon={<DeleteIcon />}
                ml={3}
            />
        </Flex>
    );
};
