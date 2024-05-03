import { FaSignOutAlt } from "react-icons/fa";
import {
  ArgonLogoDark,
  ArgonLogoLight,
  ChakraLogoDark,
  ChakraLogoLight,
  ProfileIcon,
  SettingsIcon,
} from "components/Icons/Icons";
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
} from "@chakra-ui/react";
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
import { ArrowBackIcon } from "@chakra-ui/icons";

import { DeleteIcon, EditIcon } from "@chakra-ui/icons";
import React, { useEffect, useState } from "react";
import { useHistory, useLocation } from "react-router-dom";
import Card from "components/Card/Card.js";
import CardBody from "components/Card/CardBody.js";
import CardHeader from "components/Card/CardHeader.js";
import TablesTableRow from "components/Tables/TablesTableRow";
import { RocketIcon } from "components/Icons/Icons";
import AxiosInstance from "config/AxiosInstance";
import Loader from "react-js-loader";
import TableComponent from "TableComponent";

function Tables() {
  const location = useLocation();
  const [banks, setBanks] = useState([]);
  const textColor = useColorModeValue("gray.700", "white");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const history = useHistory();
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState("");
  const [branch, setBranch] = useState({});
  const [searchTerm, setSearchTerm] = useState("");

  const searchParams = new URLSearchParams(location.search);
  const id = searchParams.get("id");

  const filteredUsers =
    searchTerm.length === 0
      ? banks
      : banks.filter(
          (user) =>
            user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.role.toLowerCase().includes(searchTerm.toLowerCase())
        );

  let navbarIcon = useColorModeValue("white", "gray.200");
  let menuBg = useColorModeValue("white", "navy.800");

  const fetchBanks = async () => {
    try {
      const response = await AxiosInstance.get("/savaj_user/" + id);
      if (response.data.data) {
        setBanks(response.data.data);
        setBranch(response.data.branch);
      }
      setLoading(false);
    } catch (error) {
      console.error("Error fetching banks:", error);
    }
  };

  useEffect(() => {
    fetchBanks();
  }, []);

  const navigateToAnotherPage = (userId) => {
    if (userId) {
      history.push(
        "/superadmin/addsavajcapitaluser?id=" + userId + "&&branch_id=" + id
      );
      return;
    }
    history.push("/superadmin/addsavajcapitaluser");
  };

  const navigateToAnotherPageUser = () => {
    history.push("/superadmin/addsavajcapitaluser?branch_id=" + id);
  };

  const allHeaders = [
    "Bank Name",
    "Name",
    "role",
    "create",
    "update",
    "Action",
  ];

  const formattedData = filteredUsers.map((bank) => [
    bank.branchuser_id,
    bank.email,
    bank.full_name,
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
      await AxiosInstance.delete(`/savaj_user/${bankId}`);
      fetchBanks();
      setIsDeleteDialogOpen(false);
      toast.success("User deleted successfully!");
    } catch (error) {
      console.error("Error deleting bank:", error);
      toast.error("Branch not delete");
    }
  };

  const handleDelete = (id) => {
    setSelectedBankId(id);
    setIsDeleteDialogOpen(true);
  };

  const handleEdit = (id) => {
    navigateToAnotherPage(id);
  };

  const handleRow = (id) => {
    history.push("/superadmin/assigned-file?id=" + id);
  };

  const handleAddRole = async (role) => {
    try {
      const response = await AxiosInstance.post("/role", { role });

      if (response.data.success) {
        toast.success("Role added successfully!");
        setIsAddRole(false);
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
                <IconButton
                  icon={<ArrowBackIcon />}
                  onClick={() => history.goBack()}
                  aria-label="Back"
                  mr="4"
                />
                {branch?.branch_name || "..."}{" "}
                {branch?.state && " - " + branch?.state + "," + branch?.city}
              </Text>
              <div className="thead">
                <Input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by name"
                  width="250px"
                  marginRight="10px"
                />

                <Button
                  onClick={navigateToAnotherPageUser}
                  colorScheme="blue"
                  style={{ marginRight: "10px" }}
                >
                  Add User
                </Button>
                <Button onClick={navigateToAnotherPage} colorScheme="blue">
                  Add Branch
                </Button>
                {/* <Menu>
                  <MenuButton></MenuButton>
                  <MenuList p="16px 8px" bg={menuBg} mt="10px">
                    <Flex flexDirection="column" style={{ gap: 10 }}>
                      <MenuItem
                        borderRadius="8px"
                        onClick={navigateToAnotherPageUser}
                      >
                        <Flex align="center" justifyContent="flex-start">
                          Add User
                        </Flex>
                      </MenuItem>
                      <MenuItem
                        borderRadius="8px"
                        onClick={() => {
                          navigateToAnotherPage();
                        }}
                      >
                        <Flex align="center" justifyContent="flex-start">
                          Add Branch
                        </Flex>
                      </MenuItem>
                      <MenuItem
                        borderRadius="8px"
                        onClick={() => {
                          history.push("/superadmin/savajuserroles");
                        }}
                      >
                        <Flex align="center" justifyContent="flex-start">
                          Role
                        </Flex>
                      </MenuItem>
                    </Flex>
                  </MenuList>
                </Menu> */}
              </div>
            </Flex>
          </CardHeader>
          <CardBody>
            {/* <TableComponent
              banks={banks}
              data={formattedData}
              textColor={textColor}
              borderColor={borderColor}
              loading={loading}
              allHeaders={allHeaders}
              handleDelete={handleDelete}
              handleEdit={handleEdit}
              handleRow={handleRow}
            /> */}
               <TableComponent
              // documents={documents}
              banks={banks}
              data={formattedData}
              textColor={textColor}
              borderColor={borderColor}
              loading={loading}
              allHeaders={allHeaders}
              handleRow={handleRow}
              handleDelete={handleDelete}
              handleEdit={handleEdit}
              collapse={true}
              removeIndex={3}
              removeIndex2={4}
              documentIndex={4}
              documentIndex2={5}
              name={"Created At:"}
              name2={"Updated At:"}
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
          onClose={() => setIsAddRole(false)}
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
                      setRole(e.target.value);
                    }}
                    value={role}
                    placeholder="Add role"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault(); // Prevent the default behavior of Enter key
                        handleAddRole(role); // Call the addRole function
                      }
                    }}
                  />
                </FormControl>
              </AlertDialogBody>

              <AlertDialogFooter>
                <Button ref={cancelRef} onClick={() => setIsAddRole(false)}>
                  Cancel
                </Button>
                <Button
                  colorScheme="blue"
                  onClick={() => handleAddRole(role)}
                  ml={3}
                  type="submit"
                >
                  Add Now
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

export default Tables;
