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
  FormControl,
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
import { useHistory, useLocation } from "react-router-dom";
import Card from "components/Card/Card.js";
import CardBody from "components/Card/CardBody.js";
import CardHeader from "components/Card/CardHeader.js";
import TablesTableRow from "components/Tables/TablesTableRow";
import { RocketIcon } from "components/Icons/Icons";
import AxiosInstance from "config/AxiosInstance";
import TableComponent from "TableComponent";

function LoanSubTypes() {
  const [users, setUsers] = useState([]);
  console.log('users', users)
  const textColor = useColorModeValue("gray.700", "white");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const history = useHistory();
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [loan, setLoan] = useState({});

  const [selectedLoan, setSelectedLoan] = useState("");
  const [selectedLoanId, setSelectedLoanId] = useState("");
  const [isEditLoan, setisEditLoan] = useState(false);

  const location = useLocation();

  const searchParams = new URLSearchParams(location.search);
  const id = searchParams.get("id");
  const fetchUsers = async () => {
    try {
      const response = await AxiosInstance.get("/loan_type/loan_type/" + id);
      setUsers(response.data.data);
      setLoan(response.data.loan[0]);
      setLoading(false);
    } catch (error) {
      setLoading(false);

      console.error("Error fetching users:", error);
    }
  };

  useEffect(() => {
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
            user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.number.toLowerCase().includes(searchTerm.toLowerCase())
        );

  const allHeaders = ["Loan", "Created At", "Updated At", "Action"];
  const formattedData = filteredUsers.map((item) => [
    item.loantype_id,
    item.loan_type,
    item.createdAt,
    item.updatedAt,
  ]);

  const handleDelete = (id) => {
    setSelectedUserId(id);
    setIsDeleteDialogOpen(true);
  };

  const handleEdit = (id) => {
    setisEditLoan(true);
    setSelectedLoanId(id);
    const data = users.find((user) => user.loantype_id == id);
    if (data) {
      setSelectedLoan(data.loan_type);
    } else {
      // Handle the case where the role with the specified id is not found
      console.error("Data not found for id:", id);
    }
  };

  const handleRow = (id) => {
    const data = users.find((user) => user.loantype_id === id);
  
    console.log("Navigating to documents page with data:", data);
    if(data) {
      history.push("/superadmin/documents", {
        state: { loan_id: data.loan_id, loantype_id: data.loantype_id },
      });
    } else {
      console.error("No data found for ID:", id);
    }
  };
  

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const cancelRef = React.useRef();
  const deletebranch = async (userId) => {
    try {
      const response = await AxiosInstance.delete(`/loan_type/${userId}`);
      setUsers(users.filter((user) => user.loantype_id !== userId));
      setIsDeleteDialogOpen(false);
      toast.success("Loan deleted successfully!");
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error("user not delete");
    }
  };

  const AddRole = async (loan_type) => {
    try {
      const response = await AxiosInstance.post("/loan_type/", {
        loan_type,
        loan_id: id,
      });

      if (response.data.success) {
        toast.success("Role Added successfully!");
        setisEditLoan(false);
        setSelectedLoan("");
        fetchUsers();
        setSelectedLoanId("");
      } else {
        toast.error(response.data.message || "Please try again later!");
      }
    } catch (error) {
      console.error("Submission error", error);
      toast.error("Failed to add. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const editRole = async (loan_type) => {
    try {
      const response = await AxiosInstance.put("/loan_type/" + selectedLoanId, {
        loan_type,
      });

      if (response.data.success) {
        toast.success("Role Updated successfully!");
        setisEditLoan(false);
        setSelectedLoan("");
        fetchUsers();
        setSelectedLoanId("");
      } else {
        toast.error(response.data.message || "Please try again later!");
      }
    } catch (error) {
      console.error("Submission error", error);
      toast.error("Failed to add. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Flex direction="column" pt={{ base: "120px", md: "75px" }}>
        <Card overflowX={{ sm: "scroll", xl: "hidden" }} pb="0px">
          <CardHeader p="6px 0px 22px 0px">
            <Flex justifyContent="space-between" alignItems="center">
              <Text fontSize="xl" color={textColor} fontWeight="bold">
                {loan?.loan || "..."}
              </Text>
              <Flex>
                <Input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by name"
                  width="250px"
                  marginRight="10px"
                />
                <Button onClick={() => setisEditLoan(true)} colorScheme="blue">
                  Add Loan
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

        {/* edit */}
        <AlertDialog
          isOpen={isEditLoan}
          leastDestructiveRef={cancelRef}
          onClose={() => {
            setisEditLoan(false);
            setSelectedLoan("");
          }}
        >
          <AlertDialogOverlay>
            <AlertDialogContent>
              <AlertDialogHeader fontSize="lg" fontWeight="bold">
                {selectedLoanId != "" ? "Edit Loan" : "Add Loan"}
              </AlertDialogHeader>

              <AlertDialogBody>
                <FormControl id="branch_name" isRequired>
                  <Input
                    name="branch_name"
                    onChange={(e) => {
                      setSelectedLoan(e.target.value);
                    }}
                    value={selectedLoan}
                    placeholder={
                      selectedLoanId != "" ? "Edit Loan" : "Add Loan"
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        selectedLoanId != ""
                          ? editRole(selectedLoan)
                          : AddRole(selectedLoan);
                      }
                    }}
                  />
                </FormControl>
              </AlertDialogBody>

              <AlertDialogFooter>
                <Button
                  ref={cancelRef}
                  onClick={() => {
                    setisEditLoan(false);
                    setSelectedLoan("");
                  }}
                >
                  Cancel
                </Button>
                <Button
                  colorScheme="blue"
                  onClick={() => AddRole(role)}
                  ml={3}
                  type="submit"
                >
                  {selectedLoanId != "" ? "Updated Now" : "Add Now"}
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

export default LoanSubTypes;
