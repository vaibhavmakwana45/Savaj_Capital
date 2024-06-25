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
  const history = useHistory();
  const iconBlue = useColorModeValue("#b19552", "#b19552");
  const iconBoxInside = useColorModeValue("white", "white");
  const textColor = useColorModeValue("gray.700", "white");
  const tableRowColor = useColorModeValue("#F7FAFC", "navy.900");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const textTableColor = useColorModeValue("gray.500", "white");
  const { colorMode } = useColorMode();

  const [apiData, setApiData] = useState({
    banks: 0,
    users: 0,
    savajcapitalbrnach: 0,
    superadmin: 0,
    loans: [],
  });
  const [totalAmounts, setTotalAmounts] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const responses = await Promise.all([
          AxiosInstance.get("/allcount/data-count"),
          AxiosInstance.get("/allcount/loan-files"),
        ]);

        setApiData((prev) => ({
          ...prev,
          ...responses[0].data,
          loans: responses[1].data,
        }));

        const totalAmountPromises = responses[1].data.map(async (loan) => {
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
        console.error("Failed to fetch data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <Flex justify="center" align="center" height="400px">
        <Loader
          type="spinner-circle"
          bgColor={"#b19552"}
          color={"black"}
          size={50}
        />
      </Flex>
    );
  }

  return (
    <Flex flexDirection="column" pt={{ base: "120px", md: "75px" }}>
      <SimpleGrid
        columns={{ base: 1, sm: 1, md: 2, xl: 4 }}
        spacing="24px"
        mb="20px"
      >
        <Card
          minH="125px"
          style={{ cursor: "pointer", border: "1px solid black" }}
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
                  color="gray.400"
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
                    {apiData.banks}
                  </StatNumber>
                </Flex>
              </Stat>
              <IconBox
                borderRadius="50%"
                as="box"
                h={"45px"}
                w={"45px"}
                bg={"#b19552"}
              >
                <WalletIcon h={"24px"} w={"24px"} color={iconBoxInside} />
              </IconBox>
            </Flex>
          </Flex>
        </Card>
        <Card
          minH="125px"
          style={{ cursor: "pointer", border: "1px solid black" }}
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
                  color="gray.400"
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
                    {apiData.savajcapitalbrnach}
                  </StatNumber>
                </Flex>
              </Stat>
              <IconBox
                borderRadius="50%"
                as="box"
                h={"45px"}
                w={"45px"}
                bg={"#b19552"}
              >
                <GlobeIcon h={"24px"} w={"24px"} color={iconBoxInside} />
              </IconBox>
            </Flex>
          </Flex>
        </Card>
        <Card
          minH="125px"
          style={{ cursor: "pointer", border: "1px solid black" }}
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
                  color="gray.400"
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
                    {apiData.users}
                  </StatNumber>
                </Flex>
              </Stat>
              <IconBox
                borderRadius="50%"
                as="box"
                h={"45px"}
                w={"45px"}
                bg={"#b19552"}
              >
                <PersonIcon h={"24px"} w={"24px"} color={iconBoxInside} />
              </IconBox>
            </Flex>
          </Flex>
        </Card>
        <Card
          minH="125px"
          style={{ cursor: "pointer", border: "1px solid black" }}
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
                  color="gray.400"
                  fontWeight="bold"
                  textTransform="uppercase"
                >
                  Total SuperAdmin
                </StatLabel>
                <Flex>
                  <StatNumber
                    fontSize="lg"
                    color={textColor}
                    fontWeight="bold"
                    style={{ paddingTop: "10px" }}
                  >
                    {apiData.superadmin}
                  </StatNumber>
                </Flex>
              </Stat>
              <IconBox
                borderRadius="50%"
                as="box"
                h={"45px"}
                w={"45px"}
                bg={"#b19552"}
              >
                <PersonIcon h={"24px"} w={"24px"} color={iconBoxInside} />
              </IconBox>
            </Flex>
          </Flex>
        </Card>

        <Card
          minH="125px"
          style={{ cursor: "pointer", border: "1px solid black" }}
          onClick={() => history.push("/superadmin/savajuserroles")}
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
                  color="gray.400"
                  fontWeight="bold"
                  textTransform="uppercase"
                >
                  Total Role
                </StatLabel>
                <Flex>
                  <StatNumber
                    fontSize="lg"
                    color={textColor}
                    fontWeight="bold"
                    style={{ paddingTop: "10px" }}
                  >
                    {apiData.role}
                  </StatNumber>
                </Flex>
              </Stat>
              <IconBox
                borderRadius="50%"
                as="box"
                h={"45px"}
                w={"45px"}
                bg={"#b19552"}
              >
                <PersonIcon h={"24px"} w={"24px"} color={iconBoxInside} />
              </IconBox>
            </Flex>
          </Flex>
        </Card>

        <Card
          minH="125px"
          style={{ cursor: "pointer", border: "1px solid black" }}
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
                  color="gray.400"
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
                    {apiData.files}
                  </StatNumber>
                </Flex>
              </Stat>
              <IconBox
                borderRadius="50%"
                as="box"
                h={"45px"}
                w={"45px"}
                bg={"#b19552"}
              >
                <DocumentIcon h={"24px"} w={"24px"} color={iconBoxInside} />
              </IconBox>
            </Flex>
          </Flex>
        </Card>
        {apiData.loans.map((loan) => (
          <Card
            key={loan.loan_id}
            minH="125px"
            style={{ cursor: "pointer", border: "1px solid black" }}
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
                    color="gray.400"
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
                      {loan.fileCount}
                    </StatNumber>
                  </Flex>
                  <Text as="span" color="green.400" fontWeight="bold">
                    ₹
                    {totalAmounts[loan.loan_id]?.[loan.loantype_id || "none"] ||
                      0}
                  </Text>
                </Stat>
                <IconBox
                  borderRadius="50%"
                  as="box"
                  h={"45px"}
                  w={"45px"}
                  bg={iconBlue}
                >
                  <DocumentIcon h={"24px"} w={"24px"} color={iconBoxInside} />
                </IconBox>
              </Flex>
            </Flex>
          </Card>
        ))}
      </SimpleGrid>
    </Flex>
  );
}
