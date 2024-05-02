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
import "./user.css";

function UserTable() {
  const [users, setUsers] = useState([]);
  const textColor = useColorModeValue("gray.700", "white");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const history = useHistory();
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await AxiosInstance.get("/addusers/getusers");
        setUsers(response.data.users);
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
      : users.filter((user) => {
          const searchTermLower = searchTerm.toLowerCase();
          const usernameIncludes = user.username
            .toLowerCase()
            .includes(searchTermLower);
          const emailIncludes = user.email
            .toLowerCase()
            .includes(searchTermLower);
          const numberIncludes = user.number
            .toLowerCase()
            .includes(searchTermLower);
          const aadharCardIncludes = user.aadhar_card
            .toString()
            .includes(searchTermLower); // Directly include Aadhar card in search logic
          const panCardIncludes =
            typeof user.pan_card === "string" &&
            user.pan_card.toLowerCase().includes(searchTermLower);

          return (
            usernameIncludes ||
            emailIncludes ||
            numberIncludes ||
            aadharCardIncludes ||
            panCardIncludes
          );
        });

  const getCibilScoreCategory = (score) => {
    if (score >= 300 && score <= 499) {
      return "Poor";
    } else if (score >= 500 && score <= 649) {
      return "Average";
    } else if (score >= 650 && score <= 749) {
      return "Good";
    } else if (score >= 750 && score <= 900) {
      return "Excellent";
    } else {
      return "Unknown";
    }
  };

  const getBackgroundColor = (category) => {
    switch (category) {
      case "Poor":
        return "#FFCCCC"; // Light red
      case "Average":
        return "#FFF8CC"; // Light yellow
      case "Good":
        return "#E5FFCC"; // Light green
      case "Excellent":
        return "#CCE5FF"; // Light blue
      default:
        return "transparent";
    }
  };
  
  const getTextColor = (category) => {
    switch (category) {
      case "Poor":
        return "#990000"; // Dark red
      default:
        return "black";
    }
  };

  const allHeaders = [
    "Name",
    "Email",
    "Number",
    "Aadhar Card",
    "Pan Card",
    "Cibil Score",
    "CS Status",
    "Action",
  ];
  const formattedData = filteredUsers.map((item) => [
    item.user_id,
    item.username,
    item.email,
    item.number,
    item.aadhar_card,
    item.pan_card,
    item.cibil_score,
    <Flex
      alignItems="center"
      backgroundColor={getBackgroundColor(
        getCibilScoreCategory(item.cibil_score)
      )}
      color={getTextColor(getCibilScoreCategory(item.cibil_score))}
      padding="0.5rem"
      borderRadius="0.5rem"
    >
      {getCibilScoreCategory(item.cibil_score)}
    </Flex>,
  ]);

  const handleDelete = (id) => {
    setSelectedUserId(id);
    setIsDeleteDialogOpen(true);
    console.log('id', id)
  };

  const handleEdit = (id) => {
    history.push("/superadmin/adduser?id=" + id);
  };

  const handleRow = (id) => {};

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
            <Flex justifyContent="space-between" className="thead">
              <Text
                fontSize="xl"
                color={textColor}
                fontWeight="bold"
                className="ttext"
              >
                All Customers
              </Text>
              <Flex className="thead">
                <Input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by name"
                  width="250px"
                  marginRight="10px"
                />
                <Button
                  onClick={() => history.push("/superadmin/adduser")}
                  colorScheme="blue"
                  className="adduser-btn"
                >
                  Add Customer
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
              handleDelete={handleDelete}
              handleEdit={handleEdit}
              handleRow={handleRow}
            />
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
