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
    FormControl
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

function UserTable() {
    const [users, setUsers] = useState([]);
    const textColor = useColorModeValue("gray.700", "white");
    const borderColor = useColorModeValue("gray.200", "gray.600");
    const history = useHistory();
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedLoan, setSelectedLoan] = useState("")
    const [selectedLoanId, setSelectedLoanId] = useState("")
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
            : users.filter(
                (user) =>
                    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    user.number.toLowerCase().includes(searchTerm.toLowerCase())
            );

    const allHeaders = [
        "Loan",
        "Loan Types",
        "Created At",
        "Updated At",
        "Action",
    ];
    const formattedData = filteredUsers.map((item) => [
        item.loan_id,
        item.loan,
        item.loantype_count,
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
        const data = users.find((user) => user.loan_id == id)
        if (data) {
            setSelectedLoan(data.loan);
        } else {
            // Handle the case where the role with the specified id is not found
            console.error("Data not found for id:", id);
        }

    };

    const handleRow = (id) => {
        // history.push("/superadmin/loantype?id=" + id);
        const data = users.find((user) => user.loan_id == id)

        if (data.loantype_count == 0) {
            alert("navigate it to documents")
        } else {
            history.push("/superadmin/loantype?id=" + id);
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
                toast.error(response.data.message || "Please try again later!")
            }
            setIsDeleteDialogOpen(false);

        } catch (error) {
            console.error("Error deleting user:", error);
            toast.error("user not delete");
        }
    };


    const editRole = async (loan) => {
        try {
            const response = await AxiosInstance.put(
                "/loan/" + selectedLoanId,
                { loan }
            );

            if (response.data.success) {
                toast.success("Role Updated successfully!");
                setisEditLoan(false);
                setSelectedLoan("")
                fetchUsers()
                setSelectedLoanId("")
            } else {
                toast.error(response.data.message || "Please try again later!")
            }

        } catch (error) {
            console.error("Submission error", error);
            toast.error("Failed to add. Please try again.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <>
            <Flex direction="column" pt={{ base: "120px", md: "75px" }}>
                <Card overflowX={{ sm: "scroll", xl: "hidden" }} pb="0px">
                    <CardHeader p="6px 0px 22px 0px">
                        <Flex justifyContent="space-between" alignItems="center">
                            <Text fontSize="xl" color={textColor} fontWeight="bold">
                                All Loan
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
                                    onClick={() => history.push("/superadmin/addloantype")}
                                    colorScheme="blue"
                                >
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
                    onClose={() => { setisEditLoan(false); setSelectedLoan("") }}
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
                                        onChange={(e) => { setSelectedLoan(e.target.value) }}
                                        value={selectedLoan}
                                        placeholder="Edit Loan"
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault(); 
                                                    editRole(selectedLoan)
                                            }
                                        }}
                                    />
                                </FormControl>
                            </AlertDialogBody>

                            <AlertDialogFooter>
                                <Button
                                    ref={cancelRef}
                                    onClick={() => { setisEditLoan(false); setSelectedLoan("") }}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    colorScheme="blue"
                                    onClick={() => handleAddRole(role)}
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

export default UserTable;
