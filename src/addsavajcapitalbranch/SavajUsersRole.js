import { FaSignOutAlt } from "react-icons/fa";
import {
  ArgonLogoDark,
  ArgonLogoLight,
  ChakraLogoDark,
  ChakraLogoLight,
  ProfileIcon,
  SettingsIcon,
} from "components/Icons/Icons"; // Chakra Imports
import {
  Box,
  Button,
  Flex,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Stack,
  FormControl,
  Text,
  useColorMode,
  useColorModeValue,
  Input,
} from "@chakra-ui/react"; // Add axios to your imports
import axios from "axios";
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
import { useHistory, useLocation } from "react-router-dom";
import Card from "components/Card/Card.js";
import CardBody from "components/Card/CardBody.js";
import CardHeader from "components/Card/CardHeader.js";
import AxiosInstance from "config/AxiosInstance";
import TableComponent from "TableComponent";

function SavajUsersRole() {
  const location = useLocation();
  const [banks, setBanks] = useState([]);
  const textColor = useColorModeValue("gray.700", "white");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRoleId, setSelectedRoleId] = useState("");
  const [selectedRole, setSelectedRole] = useState("");

  const searchParams = new URLSearchParams(location.search);
  const id = searchParams.get("id");

  const getRolesData = async () => {
    try {
      const response = await AxiosInstance.get("/role/");

      if (response.data.success) {
        setBanks(response.data.data);
        setLoading(false);
      } else {
        alert("Please try again later...!");
      }
    } catch (error) {
      setLoading(false);
      console.error(error);
    }
  };

  const filteredUsers =
    searchTerm.length === 0
      ? banks
      : banks.filter(
          (user) =>
            user.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.createdAt.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.updatedAt.toLowerCase().includes(searchTerm.toLowerCase())
        );

  useEffect(() => {
    getRolesData();
  }, []);

  const allHeaders = ["role", "create date", "update date", "Action"];

  const formattedData = filteredUsers.map((bank) => [
    bank.role_id,
    bank.role,
    bank.createdAt,
    bank.updatedAt,
  ]);

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isAddRole, setIsAddRole] = useState(false);
  const [selectedBankId, setSelectedBankId] = useState(null);
  const cancelRef = React.useRef();
  const deleteBank = async (bankId) => {
    try {
      const response = await AxiosInstance.delete(`/role/${bankId}`);
      getRolesData();
      setIsDeleteDialogOpen(false);
      if (response.data.success) {
        toast.success("Role deleted successfully!");
      } else if (response.data.statusCode === 201) {
        toast.error(response.data.message);
      } else {
        toast.error(response.data.message || "Please try again later!");
      }
    } catch (error) {
      console.error("Error deleting bank:", error);
      toast.error(error);
    }
  };

  const handleDelete = (id) => {
    setSelectedBankId(id);
    setIsDeleteDialogOpen(true);
  };

  const handleEdit = (id) => {
    setSelectedRoleId(id);
    setIsAddRole(true);

    const role = banks.find((bank) => bank.role_id === id);

    if (role) {
      setSelectedRole(role.role);
    } else {
      console.error("Role not found for id:", id);
    }
  };

  const handleRow = (id) => {};

  const handleAddRole = async (role) => {
    try {
      const response = await AxiosInstance.post("/role", { role });

      if (response.data.success) {
        toast.success("Role added successfully!");
        setIsAddRole(false);
        setSelectedRoleId("");
        getRolesData();
        setRole("");
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

  const editRole = async () => {
    try {
      const response = await AxiosInstance.put(`/role/${selectedRoleId}`, {
        role: selectedRole,
      });

      if (response.data.success) {
        toast.success("Role Updated successfully!");
        setIsAddRole(false);
        setSelectedRoleId("");
        getRolesData();
        setRole("");
      } else {
        toast.error(response.data.message || "Please try again later!");
      }
    } catch (error) {
      console.error("Error editing role:", error);
      toast.error("Failed to edit role. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Flex direction="column" pt={{ base: "120px", md: "75px" }}>
        <Card overflowX={{ sm: "scroll", xl: "hidden" }} pb="0px">
          <CardHeader p="6px 0px 22px 0px">
            <Flex
              justifyContent="space-between"
              alignItems="center"
              className="thead"
            >
              <Text
                fontSize="xl"
                color={textColor}
                fontWeight="bold"
                className="ttext d-flex"
              >
                Savaj Capital User Roles
              </Text>
              <div>
                <Input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by name"
                  width="250px"
                  marginRight="10px"
                />
                <Button
                  onClick={() => {
                    setIsAddRole(true);
                  }}
                  colorScheme="blue"
                  style={{
                    backgroundColor: "#b19552",
                    color: "#fff",
                  }}
                >
                  Add Role
                </Button>
              </div>
            </Flex>
          </CardHeader>
          <CardBody>
            <TableComponent
              banks={banks}
              data={formattedData}
              textColor={textColor}
              borderColor={borderColor}
              loading={loading}
              allHeaders={allHeaders}
              handleDelete={handleDelete}
              handleEdit={handleEdit}
              handleRow={handleRow}
              showPagination={true}
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
                Delete Bank
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
                  onClick={() => deleteBank(selectedBankId)}
                  ml={3}
                >
                  Delete
                </Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialogOverlay>
        </AlertDialog>
        <AlertDialog
          isOpen={isAddRole}
          leastDestructiveRef={cancelRef}
          onClose={() => {
            setIsAddRole(false);
            setSelectedRoleId("");
          }}
        >
          <AlertDialogOverlay>
            <AlertDialogContent>
              <AlertDialogHeader fontSize="lg" fontWeight="bold">
                Add Role
              </AlertDialogHeader>

              <AlertDialogBody>
                <FormControl id="branch_name" isRequired>
                  <Input
                    name="branch_name"
                    onChange={(e) => {
                      selectedRoleId == ""
                        ? setRole(e.target.value)
                        : setSelectedRole(e.target.value);
                    }}
                    value={selectedRoleId == "" ? role : selectedRole}
                    placeholder="Add role"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        if (selectedRoleId == "") {
                          handleAddRole(role);
                        } else {
                          editRole(selectedRole);
                        }
                      }
                    }}
                  />
                </FormControl>
              </AlertDialogBody>

              <AlertDialogFooter>
                <Button
                  ref={cancelRef}
                  onClick={() => {
                    setIsAddRole(false);
                    setSelectedRoleId("");
                  }}
                  style={{
                    backgroundColor: "#414650",
                    border: "2px solid #b19552",
                  }}
                >
                  Cancel
                </Button>
                <Button
                  colorScheme="blue"
                  onClick={selectedRoleId ? editRole : handleAddRole}
                  ml={3}
                  style={{
                    backgroundColor: "#b19552",
                    color: "#fff",
                  }}
                >
                  {selectedRoleId ? "Update Now" : "Add Now"}
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

export default SavajUsersRole;
