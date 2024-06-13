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

function SavajAssignFile() {
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

  //   const [scBranch, setScBranch] = useState([]);

  //   const fetchScBranch = async () => {
  //     try {
  //       const response = await AxiosInstance.get("/addbankuser");
  //       setScBranch(response.data.data);
  //     } catch (error) {
  //       console.error("Error fetching files:", error);
  //     }
  //   };
  //   useEffect(() => {
  //     fetchScBranch();
  //   }, []);

  //   const [selectedBranchId, setSelectedBranchId] = useState(null);
  //   const [branchUser, setBranchUser] = useState([]);
  //   const [selectedBranchUserId, setSelectedBranchUserId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedFileId, setSelectedFileId] = useState(null);

  //   useEffect(() => {
  //     const fetchBranchUser = async () => {
  //       if (!selectedBranchId) {
  //         setBranchUser([]);
  //         return;
  //       }
  //       try {
  //         const response = await AxiosInstance.get(
  //           `/bank_user/${selectedBranchId}`
  //         );
  //         setBranchUser(response.data.data || []);
  //         setLoading(false);
  //       } catch (error) {
  //         console.error("Error fetching branch users:", error);
  //       }
  //     };

  //     fetchBranchUser();
  //   }, [selectedBranchId]);
  const [savajcapitalbranch, setSavajcapitalbranch] = useState([]);
  const [selectedBranchId, setSelectedBranchId] = useState(null);
  const [savajcapitalbranchUser, setSavajcapitalbranchUser] = useState([]);
  const [roles, setRoles] = useState([]);
  const [selectedBranchUserId, setSelectedBranchUserId] = useState(null);

  useEffect(() => {
    const fetchSavajcapitalbranch = async () => {
      try {
        const response = await AxiosInstance.get("/branch");
        setSavajcapitalbranch(response.data.data);
      } catch (error) {
        console.error("Error fetching branches:", error);
      }
    };

    fetchSavajcapitalbranch();
    getRolesData();
  }, []);

  useEffect(() => {
    const fetchSavajcapitalbranchUser = async () => {
      if (!selectedBranchId) {
        setSavajcapitalbranchUser([]);
        return;
      }
      try {
        const response = await AxiosInstance.get(
          `/savaj_user/${selectedBranchId}`
        );
        setSavajcapitalbranchUser(response.data.data || []);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching branch users:", error);
      }
    };

    fetchSavajcapitalbranchUser();
  }, [selectedBranchId]);

  const getRolesData = async () => {
    try {
      const response = await AxiosInstance.get("/role/");
      if (response.data.success) {
        setRoles(response.data.data);
      } else {
        alert("Please try again later...!");
      }
    } catch (error) {
      console.error("Error fetching roles:", error);
    }
  };

  const getRoleName = (roleId) => {
    const role = roles.find((role) => role.role_id === roleId);
    return role ? role.role : "No role found";
  };
  const handleSubmitData = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        file_id: selectedFileId,
        branch_id: selectedBranchId,
        branchuser_id: selectedBranchUserId,
      };

      await AxiosInstance.post("/branch_assign", payload);

      history.push("/superadmin/savajcapitalbranch");
      toast.success("All data submitted successfully!");
    } catch (error) {
      console.error("Error while uploading files or submitting data:", error);
      toast.error("Submission failed! Please try again.");
    } finally {
      setLoading(false);
    }
  };

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
            <FormControl id="branch_id" mt={4} isRequired>
              <FormLabel>Savaj Capital Branch</FormLabel>
              <Select
                placeholder="Select Branch"
                onChange={(e) => setSelectedBranchId(e.target.value)}
              >
                {savajcapitalbranch.map((branch) => (
                  <option key={branch.branch_id} value={branch.branch_id}>
                    {`${branch.branch_name} (${branch.city})`}
                  </option>
                ))}
              </Select>
            </FormControl>

            {selectedBranchId && (
              <FormControl id="branchuser_id" mt={4} isRequired>
                <FormLabel>Branch User</FormLabel>
                {savajcapitalbranchUser.length > 0 ? (
                  <Select
                    placeholder="Select User"
                    onChange={(e) => setSelectedBranchUserId(e.target.value)}
                  >
                    {savajcapitalbranchUser.map((user) => (
                      <option
                        key={user.branchuser_id}
                        value={user.branchuser_id}
                      >
                        {`${user.full_name} (${getRoleName(user.role_id)})`}
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

export default SavajAssignFile;
