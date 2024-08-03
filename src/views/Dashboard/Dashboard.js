import {
  Flex,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  Text,
  useColorMode,
  useColorModeValue,
  Spinner,
  Icon,
  Box,
} from "@chakra-ui/react";
import Card from "components/Card/Card.js";
import IconBox from "components/Icons/IconBox";
import {
  DocumentIcon,
  GlobeIcon,
  WalletIcon,
  PersonIcon,
} from "components/Icons/Icons.js";
import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import AxiosInstance from "config/AxiosInstance";
import Loader from "react-js-loader";
import { ArrowForwardIcon } from "@chakra-ui/icons";
import { FiFile } from "react-icons/fi"; // Import an appropriate file icon
export default function Dashboard() {
  const [selectedRegion, setSelectedRegion] = useState(null);
  const history = useHistory();
  const iconBoxInside = useColorModeValue("white", "white");
  const textColor = useColorModeValue("gray.700", "white");
  const { colorMode } = useColorMode();

  const [dataCount, setDataCount] = useState({
    banks: 0,
    users: 0,
    savajcapitalbrnach: 0,
    superadmin: 0,
  });
  const [loans, setLoans] = useState([]);
  const [totalAmounts, setTotalAmounts] = useState({});
  const [loadingLoans, setLoadingLoans] = useState(true);

  useEffect(() => {
    const fetchDataCount = async () => {
      try {
        const response = await AxiosInstance.get("/allcount/data-count");
        setDataCount(response.data);
      } catch (error) {
        console.error("Failed to fetch data count:", error);
      }
    };

    fetchDataCount();
  }, []);

  useEffect(() => {
    const fetchLoans = async () => {
      try {
        const response = await AxiosInstance.get("/allcount/loan-files");
        setLoans(response.data);

        const totalAmountPromises = response.data.map(async (loan) => {
          const { loan_id, loantype_id } = loan;
          const response = await AxiosInstance.get(
            `/file_upload/amounts/${loan_id}/${loantype_id || ""}`
          );

          return {
            loan_id,
            loantype_id,
            totalAmount: response.data.totalAmount,
          };
        });

        const totalAmountsData = await Promise.all(totalAmountPromises);
        const totalAmountsMap = totalAmountsData.reduce(
          (acc, { loan_id, loantype_id, totalAmount }) => {
            if (!acc[loan_id]) {
              acc[loan_id] = {};
            }
            acc[loan_id][loantype_id || "none"] = totalAmount;
            return acc;
          },
          {}
        );
        setTotalAmounts(totalAmountsMap);
      } catch (error) {
        console.error("Failed to fetch loans:", error);
      } finally {
        setLoadingLoans(false);
      }
    };

    fetchLoans();
  }, []);

  const topBgColor = useColorModeValue("#8c6d62", "#8c6d62");
  const statusBgColor = "#ffffff";
  const bottomBgColor = useColorModeValue("#f4f1e4", "#333");
  const borderColor = useColorModeValue("#b19552", "#d4c6a5");

  return (
    <Flex flexDirection="column" pt={{ base: "120px", md: "75px" }}>
      <SimpleGrid
        columns={{ base: 1, sm: 1, md: 2, xl: 5 }}
        spacing="24px"
        mb="20px"
      >
        <Card
          minH="169px"
          minW="200px"
          style={{
            cursor: "pointer",
            border: "1px solid #212529",
            background: "#E0E9FF",
            borderRadius: "16px 16px 16px 16px",
            position: "relative",
          }}
          onClick={() => history.push("/superadmin/savajcapitalbranch")}
        >
          <Flex direction="column" p="0px">
            <Flex flexDirection="row" justify="space-between" align="center">
              <IconBox
                borderRadius="50%"
                as="box"
                h={"45px"}
                w={"45px"}
                bg={"#212529"}
              >
                <GlobeIcon h={"24px"} w={"24px"} color={iconBoxInside} />
              </IconBox>
              <Box
                borderRadius="50%"
                border="1px solid black"
                display="flex"
                alignItems="center"
                justifyContent="center"
                h="24px"
                w="24px"
              >
                <Icon as={ArrowForwardIcon} h={3} w={3} color="black" />
              </Box>
            </Flex>
            <Stat mt="10px">
              <StatLabel fontSize="md" color="#212529" fontWeight="bold">
                Total Branch
              </StatLabel>
              <StatLabel fontSize="md" color="#212529" fontWeight="bold">
                (Savaj Capital)
              </StatLabel>
              <StatNumber fontSize="2xl" color={textColor} fontWeight="bold">
                {dataCount.savajcapitalbrnach}
              </StatNumber>
            </Stat>
          </Flex>
        </Card>
        <Card
          minH="169px"
          minW="200px"
          style={{
            cursor: "pointer",
            border: "1px solid #212529",
            background: "#E4FFE0",
            borderRadius: "16px 16px 16px 16px",
            position: "relative",
          }}
          onClick={() => history.push("/superadmin/savajcapitalbranch")}
        >
          <Flex direction="column" p="0px">
            <Flex flexDirection="row" justify="space-between" align="center">
              <IconBox
                borderRadius="50%"
                as="box"
                h={"45px"}
                w={"45px"}
                bg={"#212529"}
              >
                <PersonIcon h={"24px"} w={"24px"} color={iconBoxInside} />
              </IconBox>
              <Box
                borderRadius="50%"
                border="1px solid black"
                display="flex"
                alignItems="center"
                justifyContent="center"
                h="24px"
                w="24px"
              >
                <Icon as={ArrowForwardIcon} h={3} w={3} color="black" />
              </Box>
            </Flex>
            <Stat mt="10px">
              <StatLabel fontSize="md" color="#212529" fontWeight="bold">
                Total Savaj
              </StatLabel>
              <StatLabel fontSize="md" color="#212529" fontWeight="bold">
                Capital User
              </StatLabel>
              <StatNumber fontSize="2xl" color={textColor} fontWeight="bold">
                {dataCount.savajcapitalbrnach}
              </StatNumber>
            </Stat>
          </Flex>
        </Card>
        <Card
          minH="169px"
          minW="200px"
          style={{
            cursor: "pointer",
            border: "1px solid #212529",
            background: "#FFE0E0",
            borderRadius: "16px 16px 16px 16px",
            position: "relative",
          }}
          onClick={() => history.push("/superadmin/bank")}
        >
          <Flex direction="column" p="0px">
            <Flex flexDirection="row" justify="space-between" align="center">
              <IconBox
                borderRadius="50%"
                as="box"
                h={"45px"}
                w={"45px"}
                bg={"#212529"}
              >
                <WalletIcon h={"24px"} w={"24px"} color={iconBoxInside} />
              </IconBox>
              <Box
                borderRadius="50%"
                border="1px solid black"
                display="flex"
                alignItems="center"
                justifyContent="center"
                h="24px"
                w="24px"
              >
                <Icon as={ArrowForwardIcon} h={3} w={3} color="black" />
              </Box>
            </Flex>
            <Stat mt="10px">
              <StatLabel fontSize="md" color="#212529" fontWeight="bold" pb="6">
                Total Bank
              </StatLabel>

              <StatNumber fontSize="2xl" color={textColor} fontWeight="bold">
                {dataCount.banks}
              </StatNumber>
            </Stat>
          </Flex>
        </Card>
        <Card
          minH="169px"
          minW="200px"
          style={{
            cursor: "pointer",
            border: "1px solid #212529",
            background: "#FFFCE0",
            borderRadius: "16px 16px 16px 16px",
            position: "relative",
          }}
          onClick={() => history.push("/superadmin/bank")}
        >
          <Flex direction="column" p="0px">
            <Flex flexDirection="row" justify="space-between" align="center">
              <IconBox
                borderRadius="50%"
                as="box"
                h={"45px"}
                w={"45px"}
                bg={"#212529"}
              >
                <PersonIcon h={"24px"} w={"24px"} color={iconBoxInside} />
              </IconBox>
              <Box
                borderRadius="50%"
                border="1px solid black"
                display="flex"
                alignItems="center"
                justifyContent="center"
                h="24px"
                w="24px"
              >
                <Icon as={ArrowForwardIcon} h={3} w={3} color="black" />
              </Box>
            </Flex>
            <Stat mt="10px">
              <StatLabel fontSize="md" color="#212529" fontWeight="bold" pb="6">
                Total Bank Users
              </StatLabel>

              <StatNumber fontSize="2xl" color={textColor} fontWeight="bold">
                {dataCount.bankuser}
              </StatNumber>
            </Stat>
          </Flex>
        </Card>

        <Card
          minH="169px"
          minW="200px"
          style={{
            cursor: "pointer",
            border: "1px solid #212529",
            background: "#FFFCE0",
            borderRadius: "16px 16px 16px 16px",
            position: "relative",
          }}
          onClick={() => history.push("/superadmin/alluser")}
        >
          <Flex direction="column" p="0px">
            <Flex flexDirection="row" justify="space-between" align="center">
              <IconBox
                borderRadius="50%"
                as="box"
                h={"45px"}
                w={"45px"}
                bg={"#212529"}
              >
                <PersonIcon h={"24px"} w={"24px"} color={iconBoxInside} />
              </IconBox>
              <Box
                borderRadius="50%"
                border="1px solid black"
                display="flex"
                alignItems="center"
                justifyContent="center"
                h="24px"
                w="24px"
              >
                <Icon as={ArrowForwardIcon} h={3} w={3} color="black" />
              </Box>
            </Flex>
            <Stat mt="10px">
              <StatLabel fontSize="md" color="#212529" fontWeight="bold" pb="6">
                Total Customer
              </StatLabel>

              <StatNumber fontSize="2xl" color={textColor} fontWeight="bold">
                {dataCount.users}
              </StatNumber>
            </Stat>
          </Flex>
        </Card>
        <Card
          minH="169px"
          minW="200px"
          style={{
            cursor: "pointer",
            border: "1px solid #212529",
            background: "#E0E9FF",
            borderRadius: "16px 16px 16px 16px",
            position: "relative",
          }}
          onClick={() => history.push("/superadmin/savajcapitalbranch")}
        >
          <Flex direction="column" p="0px">
            <Flex flexDirection="row" justify="space-between" align="center">
              <IconBox
                borderRadius="50%"
                as="box"
                h={"45px"}
                w={"45px"}
                bg={"#212529"}
              >
                <DocumentIcon h={"24px"} w={"24px"} color={iconBoxInside} />
              </IconBox>
              <Box
                borderRadius="50%"
                border="1px solid black"
                display="flex"
                alignItems="center"
                justifyContent="center"
                h="24px"
                w="24px"
              >
                <Icon as={ArrowForwardIcon} h={3} w={3} color="black" />
              </Box>
            </Flex>
            <Stat mt="10px">
              <StatLabel fontSize="md" color="#212529" fontWeight="bold" pb="6">
                Total Savaj User Assign File
              </StatLabel>

              <StatNumber fontSize="2xl" color={textColor} fontWeight="bold">
                {dataCount.savajuserassignfile}
              </StatNumber>
            </Stat>
          </Flex>
        </Card>
        <Card
          minH="169px"
          minW="200px"
          style={{
            cursor: "pointer",
            border: "1px solid #212529",
            background: "#E4FFE0",
            borderRadius: "16px 16px 16px 16px",
            position: "relative",
          }}
          onClick={() => history.push("/superadmin/savajcapitalbranch")}
        >
          <Flex direction="column" p="0px">
            <Flex flexDirection="row" justify="space-between" align="center">
              <IconBox
                borderRadius="50%"
                as="box"
                h={"45px"}
                w={"45px"}
                bg={"#212529"}
              >
                <DocumentIcon h={"24px"} w={"24px"} color={iconBoxInside} />
              </IconBox>
              <Box
                borderRadius="50%"
                border="1px solid black"
                display="flex"
                alignItems="center"
                justifyContent="center"
                h="24px"
                w="24px"
              >
                <Icon as={ArrowForwardIcon} h={3} w={3} color="black" />
              </Box>
            </Flex>
            <Stat mt="10px">
              <StatLabel fontSize="md" color="#212529" fontWeight="bold" pb="6">
                Total Bank User Assign File
              </StatLabel>

              <StatNumber fontSize="2xl" color={textColor} fontWeight="bold">
                {dataCount.bankuserassignfile}
              </StatNumber>
            </Stat>
          </Flex>
        </Card>

        <Card
          minH="169px"
          minW="200px"
          style={{
            cursor: "pointer",
            border: "1px solid #212529",
            background: "#FFE0E0",
            borderRadius: "16px 16px 16px 16px",
            position: "relative",
          }}
          onClick={() => history.push("/superadmin/filetable")}
        >
          <Flex direction="column" p="0px">
            <Flex flexDirection="row" justify="space-between" align="center">
              <IconBox
                borderRadius="50%"
                as="box"
                h={"45px"}
                w={"45px"}
                bg={"#212529"}
              >
                <DocumentIcon h={"24px"} w={"24px"} color={iconBoxInside} />
              </IconBox>
              <Box
                borderRadius="50%"
                border="1px solid black"
                display="flex"
                alignItems="center"
                justifyContent="center"
                h="24px"
                w="24px"
              >
                <Icon as={ArrowForwardIcon} h={3} w={3} color="black" />
              </Box>
            </Flex>
            <Stat mt="10px">
              <StatLabel fontSize="md" color="#212529" fontWeight="bold" pb="6">
                Total Files
              </StatLabel>

              <StatNumber fontSize="2xl" color={textColor} fontWeight="bold">
                {dataCount.files}
              </StatNumber>
            </Stat>
          </Flex>
        </Card>
      </SimpleGrid>
      <SimpleGrid
        columns={{ base: 1, sm: 1, md: 2, xl: 5 }}
        spacing="24px"
        mb="20px"
        justifyItems="center"
      >
        {loadingLoans ? (
          <Flex
            justify="center"
            align="center"
            height="100vh"
            width="100%"
            position="fixed"
            top="0"
            left="0"
          >
            <Loader
              type="spinner-circle"
              bgColor={"#b19552"}
              color={textColor}
              size={50}
            />
          </Flex>
        ) : (
          loans.map((loan) => (
            <Box
              key={loan.loan_id}
              minH="300px"
              maxH="300px"
              minW="230px"
              maxW="230px"
              borderRadius="15px"
              overflow="hidden"
              border={`1px solid ${useColorModeValue("#b19552", "#d4c6a5")}`}
              cursor="pointer"
              onClick={() =>
                history.push("/superadmin/filetable", {
                  state: {
                    loan: loan.loan,
                    loan_id: loan.loan_id,
                    loantype_id: loan.loantype_id,
                  },
                })
              }
              display="flex"
              flexDirection="column"
              justifyContent="space-between"
            >
              <Box bg="#B3954F" p="15px" textAlign="center" flexShrink="0">
                <Flex alignItems="center">
                  <Box
                    borderRadius="50%"
                    bg="#fff"
                    h="45px"
                    w="45px"
                    display="inline-flex"
                    alignItems="center"
                    justifyContent="center"
                    mr="10px"
                  >
                    <FiFile
                      size="24px"
                      color={useColorModeValue("#8c6d62", "#8c6d62")}
                    />
                  </Box>
                  <Stat>
                    <StatLabel fontSize="sm" color="#fff" fontWeight="bold">
                      {loan.loanType !== "Unknown"
                        ? `${loan.loan} (${loan.loanType})`
                        : loan.loan}
                    </StatLabel>
                  </Stat>
                </Flex>
              </Box>

              <Box bg="#ffffff" p="15px" flexGrow="1" overflowY="auto">
                <Flex direction="column" width="100%">
                  {Object.entries(loan.statusCounts)
                    .filter(([_, { count }]) => count > 0)
                    .map(([status, { count, color }], index) => (
                      <Flex
                        key={status}
                        direction="row"
                        align="center"
                        mb="5px"
                        width="100%"
                        justifyContent="space-between"
                      >
                        <Flex align="center">
                          <Box
                            bg={color}
                            borderRadius="50%"
                            h="10px"
                            w="10px"
                            mr="8px"
                          />
                          <Text
                            fontSize="sm"
                            fontWeight="bold"
                            color={textColor}
                          >
                            {status}
                          </Text>
                        </Flex>
                        <Text fontSize="sm" color={textColor}>
                          {count}
                        </Text>
                      </Flex>
                    ))}
                </Flex>
              </Box>

              <Box bg="#B3954F" p="10px" textAlign="center" flexShrink="0">
                <Flex alignItems="center" justifyContent="space-between">
                  <Text fontSize="sm" color="#fff" fontWeight="bold">
                    {loan.fileCount} Files
                  </Text>
                  <Text fontSize="sm" color="#fff" fontWeight="bold">
                    ₹{" "}
                    {totalAmounts[loan.loan_id]?.[loan.loantype_id || "none"] ||
                      0}
                  </Text>
                </Flex>
              </Box>
            </Box>
          ))
        )}
      </SimpleGrid>
    </Flex>
  );
}
