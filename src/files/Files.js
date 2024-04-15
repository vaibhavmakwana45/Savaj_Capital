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
  Input,
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
import TableComponent from "TableComponent";

function Files() {
  const [users, setUsers] = useState([]);
  console.log(users, "users");
  const textColor = useColorModeValue("gray.700", "white");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const history = useHistory();
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await AxiosInstance.get("/file_uplode");
        setUsers(response.data.data);
        setLoading(false);
      } catch (error) {
        setLoading(false);

        console.error("Error fetching users:", error);
      }
    };

    fetchUsers();
  }, []);

  const navigateToAnotherPage = () => {
    history.push("/superadmin/adduser");
  };

  const filteredUsers =
    searchTerm.length === 0
      ? users
      : users.filter(
          (user) =>
            user.loan.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.loan.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.number.toLowerCase().includes(searchTerm.toLowerCase())
        );

  const allHeaders = [
    "File Id",
    "Loan",
    "Loan Type",
    "CreatedAt",
    "UpdatedAt",
    "Action",
  ];
  const formattedData = filteredUsers.map((item) => [
    item.file_id,
    item.loan_id,
    item.loan,
    item.loan_type,
    item.createdAt,
    item.updatedAt,
  ]);
  console.log(formattedData, "formattedData");

  //   const handleDelete = (id) => {
  //     setSelectedUserId(id);
  //     setIsDeleteDialogOpen(true);
  //   };

  //   const handleEdit = (id) => {
  //     history.push("/superadmin/adduser?id=" + id);
  //   };

  const handleRow = (id) => {
    history.push("/superadmin/viewfile?id=" + id);
  };


  // const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  // const [selectedUserId, setSelectedUserId] = useState(null);
  // const cancelRef = React.useRef();
  // const deletebranch = async (userId) => {
  //   try {
  //     await AxiosInstance.delete(`/addusers/deleteuser/${userId}`);
  //     setUsers(users.filter((user) => user.user_id !== userId));
  //     setIsDeleteDialogOpen(false);
  //     toast.success("User deleted successfully!");
  //   } catch (error) {
  //     console.error("Error deleting user:", error);
  //     toast.error("user not delete");
  //   }
  // };

  return (
    <>
      <Flex direction="column" pt={{ base: "120px", md: "75px" }}>
        <Card overflowX={{ sm: "scroll", xl: "hidden" }} pb="0px">
          <CardHeader p="6px 0px 22px 0px">
            <Flex justifyContent="space-between" alignItems="center">
              <Text fontSize="xl" color={textColor} fontWeight="bold">
                All Files
              </Text>
              <Flex>
                <Input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by name"
                  width="250px"
                  marginRight="10px"
                />
                <Button
                  onClick={() => history.push("/superadmin/addfile")}
                  colorScheme="blue"
                >
                  Add Files
                </Button>
              </Flex>
            </Flex>
          </CardHeader>
          <CardBody>
            <TableComponent
             data={formattedData}
              textColor={textColor}
              borderColor={borderColor}
              loading={loading}
              allHeaders={allHeaders}
              //   handleDelete={handleDelete}
              //   handleEdit={handleEdit}
              handleRow={handleRow}
            />
          </CardBody>
        </Card>
      </Flex>
      <Toaster />
    </>
  );
}

export default Files;
