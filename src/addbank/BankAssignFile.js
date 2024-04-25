import {
  Flex,
  Text,
  Button,
  FormControl,
  FormLabel,
  Input,
  Select,
  useColorModeValue,
  InputGroup,
  InputRightElement,
} from "@chakra-ui/react";
import Card from "components/Card/Card.js";
import CardBody from "components/Card/CardBody.js";
import CardHeader from "components/Card/CardHeader.js";
import React, { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { Country, State, City } from "country-state-city";
import axios from "axios";
import { useHistory, useLocation } from "react-router-dom";
import AxiosInstance from "config/AxiosInstance";
import { ViewIcon, ViewOffIcon } from "@chakra-ui/icons";

function BankAssignFile() {
  const textColor = useColorModeValue("gray.700", "white");
  const [files, setFiles] = useState([]);

  const fetchFiles = async () => {
    try {
      const response = await AxiosInstance.get("/file_upload/allfiles");
      setFiles(response.data.data);
      console.log('first', response.data.data)
    } catch (error) {
      console.error("Error fetching files:", error);
    }
  };
  useEffect(() => {
    fetchFiles();
  }, []);

  return (
    <>
      <Flex direction="column" pt={{ base: "120px", md: "75px" }}>
        <Card overflowX={{ sm: "scroll", xl: "hidden" }}>
          <CardHeader p="6px 0px 22px 0px">
            <Flex justifyContent="space-between" alignItems="center">
              <Text fontSize="xl" color={textColor} fontWeight="bold">
                Assign File
              </Text>
            </Flex>
          </CardHeader>
          <CardBody>
            <FormControl id="file_id" mt={4} isRequired>
              <FormLabel>File</FormLabel>
              <Select placeholder="Select File">
                {files?.map((file) => (
                  <option key={file.file_id} value={file.file_id}>
                    {`${file.file_id}`}
                  </option>
                ))}
              </Select>
            </FormControl>
          </CardBody>
        </Card>
      </Flex>
      <Toaster />
    </>
  );
}

export default BankAssignFile;
