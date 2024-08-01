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

  return (
    <Flex flexDirection="column" pt={{ base: "120px", md: "75px" }}>
      <SimpleGrid
        columns={{ base: 1, sm: 1, md: 2, xl: 4 }}
        spacing="24px"
        mb="20px"
      >
        <Card
          minH="125px"
          style={{
            cursor: "pointer",
            border: "1px solid #212529",
            background: "#d4c6a5",
          }}
          onClick={() => history.push("/superadmin/savajcapitalbranch")}
        >
          <Flex direction="column">
            <Flex
              flexDirection="row"
              align="center"
              justify="center"
              w="100%"
              mb="25px"
            >
              <Stat me="auto">
                <StatLabel
                  fontSize="xs"
                  color="#212529"
                  fontWeight="bold"
                  textTransform="uppercase"
                >
                  Total Branch (Savaj Capital)
                </StatLabel>
                <Flex>
                  <StatNumber
                    fontSize="lg"
                    color={textColor}
                    fontWeight="bold"
                    style={{ paddingTop: "10px" }}
                  >
                    {dataCount.savajcapitalbrnach}
                  </StatNumber>
                </Flex>
              </Stat>
              <IconBox
                borderRadius="50%"
                as="box"
                h={"45px"}
                w={"45px"}
                bg={"#212529"}
              >
                <GlobeIcon h={"24px"} w={"24px"} color={iconBoxInside} />
              </IconBox>
            </Flex>
          </Flex>
        </Card>

        <Card
          minH="125px"
          style={{
            cursor: "pointer",
            border: "1px solid #212529",
            background: "#d4c6a5",
          }}
          onClick={() => history.push("/superadmin/savajcapitalbranch")}
        >
          <Flex direction="column">
            <Flex
              flexDirection="row"
              align="center"
              justify="center"
              w="100%"
              mb="25px"
            >
              <Stat me="auto">
                <StatLabel
                  fontSize="xs"
                  color="#212529"
                  fontWeight="bold"
                  textTransform="uppercase"
                >
                  Total Savaj User
                </StatLabel>
                <Flex>
                  <StatNumber
                    fontSize="lg"
                    color={textColor}
                    fontWeight="bold"
                    style={{ paddingTop: "10px" }}
                  >
                    {dataCount.savajuser}
                  </StatNumber>
                </Flex>
              </Stat>
              <IconBox
                borderRadius="50%"
                as="box"
                h={"45px"}
                w={"45px"}
                bg={"#212529"}
              >
                <PersonIcon h={"24px"} w={"24px"} color={iconBoxInside} />
              </IconBox>
            </Flex>
          </Flex>
        </Card>
        <Card
          minH="125px"
          style={{
            cursor: "pointer",
            border: "1px solid #212529",
            background: "#d4c6a5",
          }}
          onClick={() => history.push("/superadmin/bank")}
        >
          <Flex direction="column">
            <Flex
              flexDirection="row"
              align="center"
              justify="center"
              w="100%"
              mb="25px"
            >
              <Stat me="auto">
                <StatLabel
                  fontSize="xs"
                  color="#212529"
                  fontWeight="bold"
                  textTransform="uppercase"
                >
                  Total Bank
                </StatLabel>
                <Flex>
                  <StatNumber
                    fontSize="lg"
                    color={textColor}
                    fontWeight="bold"
                    style={{ paddingTop: "10px" }}
                  >
                    {dataCount.banks}
                  </StatNumber>
                </Flex>
              </Stat>
              <IconBox
                borderRadius="50%"
                as="box"
                h={"45px"}
                w={"45px"}
                bg={"#212529"}
              >
                <WalletIcon h={"24px"} w={"24px"} color={iconBoxInside} />
              </IconBox>
            </Flex>
          </Flex>
        </Card>
        <Card
          minH="125px"
          style={{
            cursor: "pointer",
            border: "1px solid #212529",
            background: "#d4c6a5",
          }}
          onClick={() => history.push("/superadmin/bank")}
        >
          <Flex direction="column">
            <Flex
              flexDirection="row"
              align="center"
              justify="center"
              w="100%"
              mb="25px"
            >
              <Stat me="auto">
                <StatLabel
                  fontSize="xs"
                  color="#212529"
                  fontWeight="bold"
                  textTransform="uppercase"
                >
                  Total Bank User
                </StatLabel>
                <Flex>
                  <StatNumber
                    fontSize="lg"
                    color={textColor}
                    fontWeight="bold"
                    style={{ paddingTop: "10px" }}
                  >
                    {dataCount.bankuser}
                  </StatNumber>
                </Flex>
              </Stat>
              <IconBox
                borderRadius="50%"
                as="box"
                h={"45px"}
                w={"45px"}
                bg={"#212529"}
              >
                <PersonIcon h={"24px"} w={"24px"} color={iconBoxInside} />
              </IconBox>
            </Flex>
          </Flex>
        </Card>
        <Card
          minH="125px"
          style={{
            cursor: "pointer",
            border: "1px solid #212529",
            background: "#d4c6a5",
          }}
          onClick={() => history.push("/superadmin/alluser")}
        >
          <Flex direction="column">
            <Flex
              flexDirection="row"
              align="center"
              justify="center"
              w="100%"
              mb="25px"
            >
              <Stat me="auto">
                <StatLabel
                  fontSize="xs"
                  color="#212529"
                  fontWeight="bold"
                  textTransform="uppercase"
                >
                  Total Customer
                </StatLabel>
                <Flex>
                  <StatNumber
                    fontSize="lg"
                    color={textColor}
                    fontWeight="bold"
                    style={{ paddingTop: "10px" }}
                  >
                    {dataCount.users}
                  </StatNumber>
                </Flex>
              </Stat>
              <IconBox
                borderRadius="50%"
                as="box"
                h={"45px"}
                w={"45px"}
                bg={"#212529"}
              >
                <PersonIcon h={"24px"} w={"24px"} color={iconBoxInside} />
              </IconBox>
            </Flex>
          </Flex>
        </Card>
        <Card
          minH="125px"
          style={{
            cursor: "pointer",
            border: "1px solid #212529",
            background: "#d4c6a5",
          }}
          onClick={() => history.push("/superadmin/savajcapitalbranch")}
        >
          <Flex direction="column">
            <Flex
              flexDirection="row"
              align="center"
              justify="center"
              w="100%"
              mb="25px"
            >
              <Stat me="auto">
                <StatLabel
                  fontSize="xs"
                  color="#212529"
                  fontWeight="bold"
                  textTransform="uppercase"
                >
                  Total Savaj User Assign File
                </StatLabel>
                <Flex>
                  <StatNumber
                    fontSize="lg"
                    color={textColor}
                    fontWeight="bold"
                    style={{ paddingTop: "10px" }}
                  >
                    {dataCount.savajuserassignfile}
                  </StatNumber>
                </Flex>
              </Stat>
              <IconBox
                borderRadius="50%"
                as="box"
                h={"45px"}
                w={"45px"}
                bg={"#212529"}
              >
                <DocumentIcon h={"24px"} w={"24px"} color={iconBoxInside} />
              </IconBox>
            </Flex>
          </Flex>
        </Card>

        <Card
          minH="125px"
          style={{
            cursor: "pointer",
            border: "1px solid #212529",
            background: "#d4c6a5",
          }}
          onClick={() => history.push("/superadmin/bank")}
        >
          <Flex direction="column">
            <Flex
              flexDirection="row"
              align="center"
              justify="center"
              w="100%"
              mb="25px"
            >
              <Stat me="auto">
                <StatLabel
                  fontSize="xs"
                  color="#212529"
                  fontWeight="bold"
                  textTransform="uppercase"
                >
                  Total Bank User Assign File
                </StatLabel>
                <Flex>
                  <StatNumber
                    fontSize="lg"
                    color={textColor}
                    fontWeight="bold"
                    style={{ paddingTop: "10px" }}
                  >
                    {dataCount.bankuserassignfile}
                  </StatNumber>
                </Flex>
              </Stat>
              <IconBox
                borderRadius="50%"
                as="box"
                h={"45px"}
                w={"45px"}
                bg={"#212529"}
              >
                <DocumentIcon h={"24px"} w={"24px"} color={iconBoxInside} />
              </IconBox>
            </Flex>
          </Flex>
        </Card>

        <Card
          minH="125px"
          style={{
            cursor: "pointer",
            border: "1px solid #212529",
            background: "#d4c6a5",
          }}
          onClick={() => history.push("/superadmin/filetable")}
        >
          <Flex direction="column">
            <Flex
              flexDirection="row"
              align="center"
              justify="center"
              w="100%"
              mb="25px"
            >
              <Stat me="auto">
                <StatLabel
                  fontSize="xs"
                  color="#212529"
                  fontWeight="bold"
                  textTransform="uppercase"
                >
                  Total Files
                </StatLabel>
                <Flex>
                  <StatNumber
                    fontSize="lg"
                    color={textColor}
                    fontWeight="bold"
                    style={{ paddingTop: "10px" }}
                  >
                    {dataCount.files}
                  </StatNumber>
                </Flex>
              </Stat>
              <IconBox
                borderRadius="50%"
                as="box"
                h={"45px"}
                w={"45px"}
                bg={"#212529"}
              >
                <DocumentIcon h={"24px"} w={"24px"} color={iconBoxInside} />
              </IconBox>
            </Flex>
          </Flex>
        </Card>
      </SimpleGrid>
      <SimpleGrid
        columns={{ base: 1, sm: 1, md: 2, xl: 4 }}
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
              color={"#5a5a5a"}
              size={50}
            />
          </Flex>
        ) : (
          loans.map((loan) => (
            <Card
              key={loan.loan_id}
              minH="125px"
              style={{
                cursor: "pointer",
                cursor: "pointer",
                border: `1px solid ${useColorModeValue("#b19552", "#d4c6a5")}`,
                background: useColorModeValue("#f4f1e4", "#333"),
              }}
              onClick={() =>
                history.push(`/superadmin/filetable`, {
                  state: {
                    loan: loan.loan,
                    loan_id: loan.loan_id,
                    loantype_id: loan.loantype_id,
                  },
                })
              }
            >
              <Flex direction="column">
                <Flex
                  flexDirection="row"
                  align="center"
                  justify="center"
                  w="100%"
                  mb="25px"
                >
                  <Stat me="auto">
                    <StatLabel
                      fontSize="xs"
                      color="#5a5a5a"
                      fontWeight="bold"
                      textTransform="uppercase"
                    >
                      {loan.loanType !== "Unknown"
                        ? `${loan.loan} (${loan.loanType})`
                        : loan.loan}
                    </StatLabel>
                    <Flex>
                      <StatNumber
                        fontSize="lg"
                        color={textColor}
                        fontWeight="bold"
                        style={{ paddingTop: "10px", paddingBottom: "10px" }}
                      >
                        {loan.fileCount} files
                      </StatNumber>
                    </Flex>
                    <Text as="span" color="#5a5a5a" fontWeight="bold">
                      ₹
                      {totalAmounts[loan.loan_id]?.[
                        loan.loantype_id || "none"
                      ] || 0}
                    </Text>
                  </Stat>
                  <IconBox
                    borderRadius="50%"
                    as="box"
                    h={"45px"}
                    w={"45px"}
                    bg={"#8c6d62"}
                  >
                    <DocumentIcon h={"24px"} w={"24px"} color={iconBoxInside} />
                  </IconBox>
                </Flex>

                {/* Display counts for all statuses */}
                <Flex mt="1px" wrap="wrap">
                  {Object.entries(loan.statusCounts)
                    .filter(([_, { count }]) => count > 0)
                    .map(([status, { count, color }]) => (
                      <Flex
                        key={status}
                        direction="column"
                        align="center"
                        mr="5px"
                      >
                        <Text fontSize="sm" fontWeight="bold" color={color}>
                          {status}
                        </Text>
                        <Text fontSize="md" color="#5a5a5a">
                          {count}
                        </Text>
                      </Flex>
                    ))}
                </Flex>
              </Flex>
            </Card>
          ))
        )}
      </SimpleGrid>
    </Flex>
  );
}
