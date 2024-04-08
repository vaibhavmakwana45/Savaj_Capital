// Add axios to your imports
import axios from "axios";
import {
  Flex,
  Table,
  Tbody,
  Text,
  Th,
  Thead,
  Tr,
  Td,
  useColorModeValue,
  Button,
} from "@chakra-ui/react";
import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  IconButton,
} from "@chakra-ui/react";
import toast, { Toaster } from "react-hot-toast";
import { DeleteIcon, EditIcon } from "@chakra-ui/icons";
import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import Card from "components/Card/Card.js";
import CardBody from "components/Card/CardBody.js";
import CardHeader from "components/Card/CardHeader.js";
import TablesTableRow from "components/Tables/TablesTableRow";
import { RocketIcon } from "components/Icons/Icons";
import AxiosInstance from "config/AxiosInstance";

function UserTable() {
  const [users, setUsers] = useState([]);
  const textColor = useColorModeValue("gray.700", "white");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const history = useHistory();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await AxiosInstance.get("/addusers/getusers");
        setUsers(response.data.users);
        console.log("response", response);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchUsers();
  }, []);

  const navigateToAnotherPage = () => {
    history.push("/superadmin/adduser");
  };

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const cancelRef = React.useRef();
  const deletebranch = async (userId) => {
    try {
      await AxiosInstance.delete(`/addusers/deleteuser/${userId}`);
      setUsers(users.filter((user) => user.user_id !== userId));
      setIsDeleteDialogOpen(false);
      toast.success("User deleted successfully!");
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error("user not delete");
    }
  };

  return (
    <>
      <Flex direction="column" pt={{ base: "120px", md: "75px" }}>
        <Card overflowX={{ sm: "scroll", xl: "hidden" }} pb="0px">
          <CardHeader p="6px 0px 22px 0px">
            <Flex justifyContent="space-between" alignItems="center">
              <Text fontSize="xl" color={textColor} fontWeight="bold">
                All Users
              </Text>
              <Button onClick={navigateToAnotherPage} colorScheme="blue">
                Add User
              </Button>
            </Flex>
          </CardHeader>
          <CardBody>
            <Table variant="simple" color={textColor}>
              <Thead>
                <Tr my=".8rem" pl="0px" color="gray.400">
                  <Th pl="0px" borderColor={borderColor} color="gray.400">
                    Name
                  </Th>
                  <Th borderColor={borderColor} color="gray.400">
                    Email
                  </Th>
                  <Th borderColor={borderColor} color="gray.400">
                    Number
                  </Th>
                  <Th borderColor={borderColor} color="gray.400">
                    Action
                  </Th>
                </Tr>
              </Thead>
              <Tbody>
                {users?.map((user) => (
                  <Tr key={user._id}>
                    <Td pl="0px">{user.username}</Td>
                    <Td>{user.email}</Td>
                    <Td>{user.number}</Td>
                    <Td>
                      <IconButton
                        aria-label="Delete user"
                        icon={<DeleteIcon />}
                        onClick={() => {
                          setSelectedUserId(user.user_id);
                          setIsDeleteDialogOpen(true);
                        }}
                        style={{marginRight: 15}}
                      />
                      <IconButton
                        aria-label="Edit user"
                        icon={<EditIcon />}
                        onClick={() => {
                          history.push(
                            "/superadmin/adduser?id="+user.user_id
                          );
                          // setSelectedUserId(user.user_id);
                          // setIsDeleteDialogOpen(true);
                        }}
                      />
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </CardBody>
        </Card>
        <AlertDialog
          isOpen={isDeleteDialogOpen}
          leastDestructiveRef={cancelRef}
          onClose={() => setIsDeleteDialogOpen(false)}
        >
          <AlertDialogOverlay>
            <AlertDialogContent>
              <AlertDialogHeader fontSize="lg" fontWeight="bold">
                Delete User
              </AlertDialogHeader>

              <AlertDialogBody>
                Are you sure? You can't undo this action afterwards.
              </AlertDialogBody>

              <AlertDialogFooter>
                <Button
                  ref={cancelRef}
                  onClick={() => setIsDeleteDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  colorScheme="red"
                  onClick={() => deletebranch(selectedUserId)}
                  ml={3}
                >
                  Delete
                </Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialogOverlay>
        </AlertDialog>
      </Flex>
      <Toaster />
    </>
  );
}

export default UserTable;
