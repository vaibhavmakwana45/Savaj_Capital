import { Flex, Text, useColorModeValue, Button, Input } from "@chakra-ui/react";
import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
} from "@chakra-ui/react";
import toast, { Toaster } from "react-hot-toast";
import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import Card from "components/Card/Card.js";
import CardBody from "components/Card/CardBody.js";
import CardHeader from "components/Card/CardHeader.js";
import AxiosInstance from "config/AxiosInstance";
import TableComponent from "TableComponent";

function SavajCapitalBranchTable() {
  const [savajcapitalbranch, setSavajcapitalbranch] = useState([]);
  const textColor = useColorModeValue("gray.700", "white");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const history = useHistory();
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredUsers =
    searchTerm.length === 0
      ? savajcapitalbranch
      : savajcapitalbranch.filter(
          (user) =>
            user.branch_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.state.toLowerCase().includes(searchTerm.toLowerCase())
        );

  const allHeaders = [
    "Index",
    "Savaj Capital Branch",
    "City",
    "State",
    "",
    "State",
    "Action",
  ];

  let navbarIcon = useColorModeValue("white", "gray.200");
  let menuBg = useColorModeValue("white", "navy.800");

  const formattedData = filteredUsers?.map((item, index) => [
    item.branch_id,
    index + 1,
    item.branch_name,
    item.city,
    item.state,
    item.createdAt,
    item.updatedAt,
  ]);

  const handleDelete = (id) => {
    setSelectedBranchId(id);
    setIsDeleteDialogOpen(true);
  };

  const handleEdit = (id) => {
    navigateToEditPage(id);
  };

  const handleRow = (id) => {
    history.push("savajusers?id=" + id);
  };

  const fetchSavajcapitalbranch = async () => {
    try {
      const response = await AxiosInstance.get("/branch");
      setLoading(false);
      setSavajcapitalbranch(response.data.data);
    } catch (error) {
      console.error("Error fetching savajcapitalbranch:", error);
    }
  };

  useEffect(() => {
    fetchSavajcapitalbranch();
  }, []);

  const navigateToAnotherPageUser = () => {
    history.push("/superadmin/addsavajcapitaluser");
  };

  const navigateToAnotherPage = () => {
    history.push("/superadmin/addsavajcapitalbranch");
  };

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedBranchId, setSelectedBranchId] = useState(null);
  const cancelRef = React.useRef();
  const deletebranch = async (branchId) => {
    try {
      const response = await AxiosInstance.delete(`/branch/${branchId}`);
      setSavajcapitalbranch(
        savajcapitalbranch.filter(
          (branch) => branch.savajcapitalbranch_id !== branchId
        )
      );
      setIsDeleteDialogOpen(false);
      if (response.data.success) {
        fetchSavajcapitalbranch();
        toast.success("Branch deleted Successfully!", {
          duration: 800,
        });
      } else if (response.data.statusCode === 201) {
        toast.error(response.data.message);
      } else if (response.data) {
        toast.error(response.data.message || "please try again later!", {
          duration: 800,
        });
      }
    } catch (error) {
      console.error("Error deleting branch:", error);
      toast.error(error);
    }
  };
  const navigateToEditPage = (branchId) => {
    history.push(`/superadmin/editsavajcapitalbranch/${branchId}`);
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
                fontSize="2xl"
                fontWeight="bold"
                bgGradient="linear(to-r, #b19552, #212529)"
                bgClip="text"
                className="ttext"
              >
                Savaj Capital Branches
              </Text>
            </Flex>
            <Flex className="thead" justifyContent="end">
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name"
                width="250px"
                marginRight="10px"
                style={{
                  padding: "12px", // Padding for comfortable input
                  fontSize: "16px", // Font size
                  borderRadius: "8px", // Rounded corners
                  border: "2px solid #b19552", // Solid border with custom color
                  backgroundColor: "#ffffff", // White background
                  color: "#333333", // Text color
                  outline: "none", // Remove default outline
                  boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)", // Subtle box shadow
                  transition: "all 0.3s ease-in-out", // Smooth transitions
                  fontFamily: "inherit", // Inherit default font family
                }}
              />

              <Button
                onClick={navigateToAnotherPage}
                colorScheme="blue"
                style={{
                  backgroundColor: "#b19552",
                  color: "#fff",
                  // marginTop: 10,
                }}
              >
                Add Branch
              </Button>
              <Button
                onClick={navigateToAnotherPageUser}
                colorScheme="blue"
                style={{
                  backgroundColor: "#b19552",
                  color: "#fff",
                  // marginTop: 10,
                  marginLeft: 8,
                }}
              >
                Add User
              </Button>
              {/* <Menu>
                  <MenuButton>
                  </MenuButton>
                  <MenuList p="16px 8px" bg={menuBg} mt="10px">
                    <Flex flexDirection="column" style={{ gap: 10 }}>
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
                        onClick={navigateToAnotherPageUser}
                      >
                        <Flex align="center" justifyContent="flex-start">
                          Add User
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
            </Flex>
          </CardHeader>
          <CardBody>
            {/* <TableComponent
              data={formattedData}
              loading={loading}
              allHeaders={allHeaders}
              handleDelete={handleDelete}
              handleEdit={handleEdit}
              handleRow={handleRow}
            /> */}
            <TableComponent
              // documents={documents}
              data={formattedData}
              textColor={textColor}
              borderColor={borderColor}
              loading={loading}
              allHeaders={allHeaders}
              handleRow={handleRow}
              handleDelete={handleDelete}
              handleEdit={handleEdit}
              collapse={true}
              removeIndex={4}
              removeIndex2={5}
              documentIndex={5}
              documentIndex2={6}
              name={"Created At:"}
              name2={"Updated At:"}
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
                Delete Branch
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
                  onClick={() => deletebranch(selectedBranchId)}
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

export default SavajCapitalBranchTable;
