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
  FormControl,
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
import "./loan.css";

function UserTable() {
  const [users, setUsers] = useState([]);
  const textColor = useColorModeValue("gray.700", "white");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const history = useHistory();
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLoan, setSelectedLoan] = useState("");
  const [selectedLoanId, setSelectedLoanId] = useState("");
  const [isEditLoan, setisEditLoan] = useState(false);

  const fetchUsers = async () => {
    try {
      const response = await AxiosInstance.get("/loan");
      setUsers(response.data.data);
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
      : users.filter((user) =>
          user.loan.toLowerCase().includes(searchTerm.toLowerCase())
        );

  const allHeaders = [
    "Loan",
    "Loan Types",
    "Created At",
    "Updated At",
    "Action",
    "Action",
  ];
  const formattedData = filteredUsers.map((item) => [
    item.loan_id,
    item.loan,
    item.loantype_count,
    item.createdAt,
    item.updatedAt,
    (item.loan_steps && item.loan_steps.map((step) => step.name).join(", ")) ||
      "No Steps",
  ]);

  console.log(formattedData, "formattedData");
  const handleDelete = (id) => {
    setSelectedUserId(id);
    setIsDeleteDialogOpen(true);
  };

  const handleEdit = (id) => {
    setisEditLoan(true);
    setSelectedLoanId(id);
    const data = users.find((user) => user.loan_id == id);
    if (data) {
      setSelectedLoan(data.loan);
    } else {
      console.error("Data not found for id:", id);
    }
  };
  // const handleEdit = (id) => {
  //   history.push("/superadmin/addloantype?id=" + id);
  // };

  const handleRow = (id) => {
    const data = users.find((user) => user.loan_id === id);
    if (!data) {
      console.error("No data found for loan with ID:", id);
      return;
    }

    if (data.loantype_count === 0) {
      history.push("/superadmin/documents", {
        state: { loan_id: data.loan_id },
      });
    } else {
      history.push(`/superadmin/loantype?id=${id}`, {
        state: { loan_id: data.loan_id, loantype_id: data.loantype_id },
      });
    }
  };

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const cancelRef = React.useRef();
  const deletebranch = async (userId) => {
    try {
      const response = await AxiosInstance.delete(`/loan/${userId}`);
      if (response.data.success) {
        setUsers(users.filter((user) => user.loan_id !== userId));
        toast.success("User deleted successfully!");
      } else {
        toast.error(response.data.message || "Please try again later!");
      }
      setIsDeleteDialogOpen(false);
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error("user not delete");
    }
  };

  const editRole = async (loan) => {
    try {
      const response = await AxiosInstance.put("/loan/" + selectedLoanId, {
        loan,
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
            <Flex justifyContent="space-between" className="thead">
              <Text
                fontSize="xl"
                color={textColor}
                fontWeight="bold"
                className="ttext"
              >
                All Loan
              </Text>
              <Flex className="thead">
                <Input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by name"
                  width="250px"
                  marginRight="10px"
                />
                <div className="add-doc-btn">
                  <Button
                    onClick={() => history.push("/superadmin/addloantype")}
                    colorScheme="blue"
                    className="adduser-btn mb-1"
                    style={{ backgroundColor: "#b19552", color: "#fff" }}
                  >
                    Add Loan
                  </Button>
                  <Button
                    className="loanuser-btn mb-1"
                    onClick={() => history.push("/superadmin/addloandocs")}
                    colorScheme="blue"
                    style={{
                      backgroundColor: "#b19552",
                      color: "#fff",
                      marginLeft: "10px",
                    }}
                  >
                    Add Documents
                  </Button>
                </div>
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
              showPagination={true}
              collapse={true}
              removeIndex={4}
              documentIndex={5}
              name={"Steps:"}
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
                Edit Loan
              </AlertDialogHeader>

              <AlertDialogBody>
                <FormControl id="branch_name" isRequired>
                  <Input
                    name="branch_name"
                    onChange={(e) => {
                      setSelectedLoan(e.target.value);
                    }}
                    value={selectedLoan}
                    placeholder="Edit Loan"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        editRole(selectedLoan);
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
                  style={{
                    backgroundColor: "#414650",
                    color: "#000",
                    border: "2px solid #b19552",
                  }}
                >
                  Cancel
                </Button>
                <Button
                  colorScheme="blue"
                  onClick={() =>
                    selectedLoanId !== ""
                      ? editRole(selectedLoan)
                      : AddRole(selectedLoan)
                  }
                  ml={3}
                  type="submit"
                  style={{
                    backgroundColor: "#b19552",
                    color: "#fff",
                  }}
                >
                  {selectedLoanId !== "" ? "Update Now" : "Add Now"}
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
