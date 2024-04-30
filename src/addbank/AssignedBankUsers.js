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
// import { DeleteIcon, EditIcon } from "@chakra-ui/icons";
import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import Card from "components/Card/Card.js";
import CardBody from "components/Card/CardBody.js";
import CardHeader from "components/Card/CardHeader.js";
import TablesTableRow from "components/Tables/TablesTableRow";
import { RocketIcon } from "components/Icons/Icons";
import AxiosInstance from "config/AxiosInstance";
import TableComponent from "TableComponent";
// import "../adduser/user.css";

function AssignedBankUsers() {
  const [savajUserAssignedFile, setSavajUserAssignedFile] = useState([]);
  const [savajUserName, setSavajUserName] = useState("");
  const textColor = useColorModeValue("gray.700", "white");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const history = useHistory();
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const searchParams = new URLSearchParams(location.search);
  const id = searchParams.get("id");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await AxiosInstance.get(
          `/bank_user/assigned_file/${id}`
        );
        setSavajUserAssignedFile(response.data.data);
        setSavajUserName(response?.data?.bankUserData?.bankuser_name);
        setLoading(false);
      } catch (error) {
        setLoading(false);

        console.error("Error fetching savajUserAssignedFile:", error);
      }
    };

    fetchUsers();
  }, []);

  const navigateToAnotherPage = () => {
    history.push("/superadmin/adduser");
  };

  const filteredUsers =
    searchTerm.length === 0
      ? savajUserAssignedFile
      : savajUserAssignedFile.filter(
          (user) =>
            user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.number.toLowerCase().includes(searchTerm.toLowerCase())
        );

  const allHeaders = [
    "File Id",
    "User Name",
    "Loan",
    "Loan Type",
    "CreatedAt",
    "UpdatedAt",
  ];
  const formattedData = filteredUsers.map((item) => [
    item.user_id,
    item.file_id,
    item.username,
    item.loan,
    item.loan_type,
    item.file_data.createdAt,
    item.file_data.updatedAt,
  ]);

  const handleRow = (id) => {
    console.log(id);
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
                {savajUserName ? savajUserName + "'s -" : ""} Assigned File
              </Text>
            </Flex>
          </CardHeader>
          <CardBody>
            <TableComponent
              data={formattedData}
              textColor={textColor}
              borderColor={borderColor}
              loading={loading}
              allHeaders={allHeaders}
              showDeleteButton={false}
              showEditButton={false}
              handleRow={handleRow}
            />
          </CardBody>
        </Card>
      </Flex>
      <Toaster />
    </>
  );
}

export default AssignedBankUsers;
