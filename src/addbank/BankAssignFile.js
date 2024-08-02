import {
  Flex,
  Text,
  Button,
  FormControl,
  FormLabel,
  Select,
  useColorModeValue,
} from "@chakra-ui/react";

import Card from "components/Card/Card.js";
import CardBody from "components/Card/CardBody.js";
import CardHeader from "components/Card/CardHeader.js";
import React, { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { useHistory } from "react-router-dom";
import AxiosInstance from "config/AxiosInstance";
import upArrow from "../assets/svg/uparrow.svg";
import downArrow from "../assets/svg/downarrow.svg";
import { Dropdown, DropdownItem, DropdownMenu } from "reactstrap";

function BankAssignFile() {
  const history = useHistory();
  const textColor = useColorModeValue("gray.700", "white");
  const [files, setFiles] = useState([]);

  const fetchFiles = async () => {
    try {
      const response = await AxiosInstance.get("/file_upload/allfiles");
      setFiles(response.data.data);
    } catch (error) {
      console.error("Error fetching files:", error);
    }
  };
  useEffect(() => {
    fetchFiles();
  }, []);

  const [banks, setBanks] = useState([]);

  const fetchBanks = async () => {
    try {
      const response = await AxiosInstance.get("/addbankuser");
      setBanks(response.data.data);
    } catch (error) {
      console.error("Error fetching files:", error);
    }
  };
  useEffect(() => {
    fetchBanks();
  }, []);

  const [selectedBankId, setSelectedBankId] = useState(null);
  const [bankUser, setBankUser] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedBankUserId, setSelectedBankUserId] = useState(null);
  const [selectedFileId, setSelectedFileId] = useState(null);

  useEffect(() => {
    const fetchBankUser = async () => {
      if (!selectedBankId) {
        setBankUser([]);
        return;
      }
      try {
        const response = await AxiosInstance.get(
          `/bank_user/${selectedBankId}`
        );
        setBankUser(response.data.data || []);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching branch users:", error);
      }
    };

    fetchBankUser();
  }, [selectedBankId]);

  const handleSubmitData = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        file_id: selectedFileId,
        bank_id: selectedBankId,
        bankuser_id: selectedBankUserId,
      };

      await AxiosInstance.post("/bank_approval", payload);

      history.push("/superadmin/bank");
      toast.success("All data submitted successfully!");
    } catch (error) {
      console.error("Error while uploading files or submitting data:", error);
      toast.error("Submission failed! Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const [filteredData, setFilteredData] = useState("");
  const [filterOpen, setFilterOpen] = useState("");
  const filterToggle = () => setFilterOpen(!filterOpen);
  const [selectedLoan, setSelectedLoan] = useState("");

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

              <Select
                placeholder="Select File"
                onChange={(e) => setSelectedFileId(e.target.value)}
              >
                {files?.map((file) => (
                  <option key={file.file_id} value={file.file_id}>
                    {`${file.file_id}`}
                  </option>
                ))}
              </Select>
            </FormControl>

            <div className="w-100 my-3">
              <FormLabel>Select Bank</FormLabel>
              <input
                style={{
                  width: "100%",
                  border: "0.5px solid #333",
                  padding: "5px",
                  backgroundImage: `url(${filterOpen ? upArrow : downArrow})`,
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "right center",
                  backgroundSize: "10px",
                  backgroundPosition: "right 15px center",
                  borderRadius: "5px",
                  borderColor: "inherit",
                }}
                placeholder="Select Bank"
                onFocus={() => {
                  setFilteredData(banks);
                  setFilterOpen(true);
                  filterToggle();
                }}
                onBlur={() => {
                  setTimeout(() => {
                    filterToggle();
                  }, 200);
                }}
                onChange={(e) => {
                  if (e.target.value.length !== "") {
                    setFilterOpen(true);
                  } else {
                    setFilterOpen(false);
                  }
                  const filterData = banks.filter((item) => {
                    return item.bank_name
                      .toLowerCase()
                      .includes(e.target.value.toLowerCase());
                  });
                  setSelectedLoan(e.target.value);
                  setFilteredData(filterData);
                }}
                value={selectedLoan}
              />
              <Dropdown
                className="w-100"
                isOpen={filterOpen}
                toggle={filterToggle}
              >
                <DropdownMenu className="w-100">
                  {filteredData.length > 0 ? (
                    filteredData.map((item, index) => (
                      <DropdownItem
                        key={index}
                        onClick={(e) => {
                          setSelectedLoan(
                            `${item.bank_name} (${item.branch_name})`
                          ); // Update selectedLoan
                          setSelectedBankId(item.bank_id);
                          setFilterOpen(false);
                        }}
                      >
                        {`${item.bank_name} (${item.branch_name})`}
                      </DropdownItem>
                    ))
                  ) : (
                    <DropdownItem>No data found</DropdownItem>
                  )}
                </DropdownMenu>
              </Dropdown>
            </div>

            {selectedBankId && (
              <FormControl id="bankuser_id" mt={4} isRequired>
                <FormLabel>Bank User</FormLabel>
                {bankUser.length > 0 ? (
                  <Select
                    placeholder="Select User"
                    onChange={(e) => setSelectedBankUserId(e.target.value)}
                  >
                    {bankUser.map((user) => (
                      <option key={user.bankuser_id} value={user.bankuser_id}>
                        {`${user.email}`}
                      </option>
                    ))}
                  </Select>
                ) : (
                  <Text>No users available for this branch.</Text>
                )}
              </FormControl>
            )}
            <div>
              <Button
                mt={4}
                colorScheme="teal"
                onClick={handleSubmitData}
                isLoading={loading}
                loadingText="Submitting"
                style={{
                  backgroundColor: "#b19552",
                  color: "#fff",
                  marginTop: 40,
                }}
              >
                Assign
              </Button>

              <Button
                mt={4}
                style={{
                  backgroundColor: "#414650",
                  color: "#fff",
                  marginTop: 40,
                  marginLeft: 8,
                }}
                onClick={() => history.push("/superadmin/bank")}
              >
                Cancel
              </Button>
            </div>
          </CardBody>
        </Card>
      </Flex>
      <Toaster />
    </>
  );
}

export default BankAssignFile;
