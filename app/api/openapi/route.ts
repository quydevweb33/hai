import { NextResponse } from "next/server"

export async function GET() {
  const spec = {
    openapi: "3.1.0",
    info: {
      title: "CashHash API",
      version: "0.1.0",
      description:
        "OpenAPI for the CashHash demo. Endpoints simulate Hedera-native flows: invoices, investments, bonds, attesters, events, analytics.",
    },
    paths: {
      "/api/invoices": {
        get: {
          summary: "List invoices",
          parameters: [
            {
              name: "owner",
              in: "query",
              schema: { type: "string" },
              description: "Optional owner filter (ignored in mock).",
            },
          ],
          responses: {
            200: {
              description: "Invoices",
              content: { "application/json": { schema: { $ref: "#/components/schemas/InvoicesResponse" } } },
            },
          },
        },
        post: {
          summary: "Create & list invoice",
          requestBody: {
            required: true,
            content: { "multipart/form-data": { schema: { $ref: "#/components/schemas/CreateInvoiceForm" } } },
          },
          responses: {
            200: {
              description: "Created invoice",
              content: { "application/json": { schema: { $ref: "#/components/schemas/InvoiceResponse" } } },
            },
          },
        },
      },
      "/api/invoices/{id}/invest": {
        post: {
          summary: "Invest in an invoice",
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
          requestBody: {
            required: true,
            content: { "application/json": { schema: { $ref: "#/components/schemas/InvestRequest" } } },
          },
          responses: {
            200: {
              description: "Result",
              content: { "application/json": { schema: { $ref: "#/components/schemas/ResultInvoice" } } },
            },
          },
        },
      },
      "/api/invoices/{id}/payout": {
        post: {
          summary: "Trigger payout & close",
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
          requestBody: {
            required: true,
            content: { "application/json": { schema: { $ref: "#/components/schemas/PayoutRequest" } } },
          },
          responses: {
            200: {
              description: "Result",
              content: { "application/json": { schema: { $ref: "#/components/schemas/ResultInvoice" } } },
            },
          },
        },
      },
      "/api/bond/post": {
        post: {
          summary: "Post exporter bond (HBAR)",
          requestBody: {
            required: true,
            content: { "application/json": { schema: { $ref: "#/components/schemas/PostBondRequest" } } },
          },
          responses: {
            200: {
              description: "Result",
              content: { "application/json": { schema: { $ref: "#/components/schemas/ResultInvoice" } } },
            },
          },
        },
      },
      "/api/attesters": {
        post: {
          summary: "Register attester (mock)",
          requestBody: {
            required: true,
            content: { "application/json": { schema: { $ref: "#/components/schemas/RegisterAttester" } } },
          },
          responses: {
            200: {
              description: "Registered",
              content: { "application/json": { schema: { $ref: "#/components/schemas/AttesterRegistered" } } },
            },
          },
        },
      },
      "/api/attesters/{id}/sign": {
        post: {
          summary: "Sign milestone (attester/buyer ack)",
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
          requestBody: {
            required: true,
            content: { "application/json": { schema: { $ref: "#/components/schemas/AttesterSignRequest" } } },
          },
          responses: {
            200: {
              description: "Signed",
              content: { "application/json": { schema: { $ref: "#/components/schemas/ResultInvoice" } } },
            },
          },
        },
      },
      "/api/buyer/ack": {
        post: {
          summary: "Buyer acknowledge invoice",
          requestBody: {
            required: true,
            content: { "application/json": { schema: { $ref: "#/components/schemas/BuyerAckRequest" } } },
          },
          responses: {
            200: {
              description: "ACKed",
              content: { "application/json": { schema: { $ref: "#/components/schemas/ResultInvoice" } } },
            },
          },
        },
      },
      "/api/events": {
        get: {
          summary: "Simulated HCS events",
          responses: {
            200: {
              description: "Events",
              content: { "application/json": { schema: { $ref: "#/components/schemas/EventsResponse" } } },
            },
          },
        },
      },
      "/api/portfolio": {
        get: {
          summary: "Portfolio snapshot",
          parameters: [{ name: "account", in: "query", schema: { type: "string" } }],
          responses: {
            200: {
              description: "Portfolio",
              content: { "application/json": { schema: { $ref: "#/components/schemas/PortfolioResponse" } } },
            },
          },
        },
      },
      "/api/analytics": {
        get: {
          summary: "Get analytics events (demo buffer)",
          responses: {
            200: {
              description: "Events",
              content: {
                "application/json": {
                  schema: { type: "object", properties: { events: { type: "array", items: { type: "object" } } } },
                },
              },
            },
          },
        },
        post: {
          summary: "Track analytics event (demo)",
          requestBody: {
            required: true,
            content: { "application/json": { schema: { $ref: "#/components/schemas/AnalyticsEvent" } } },
          },
          responses: {
            200: {
              description: "OK",
              content: { "application/json": { schema: { type: "object", properties: { ok: { type: "boolean" } } } } },
            },
          },
        },
      },
      "/api/mirror/topics/{topicId}/messages": {
        get: {
          summary: "Proxy Mirror Node topic messages (testnet)",
          parameters: [{ name: "topicId", in: "path", required: true, schema: { type: "string" } }],
          responses: {
            200: {
              description: "Messages",
              content: { "application/json": { schema: { type: "array", items: { type: "object" } } } },
            },
          },
        },
      },
    },
    components: {
      schemas: {
        Invoice: {
          type: "object",
          properties: {
            id: { type: "string" },
            buyer: { type: "string" },
            amountUSD: { type: "number" },
            maturity: { type: "string" },
            risk: { enum: ["green", "yellow", "red"] },
            nftId: { type: "string" },
            ftId: { type: "string" },
            fileIds: { type: "array", items: { type: "string" } },
            topicId: { type: "string" },
            status: { enum: ["LISTED", "FUNDED", "ACKED", "PAID", "CLOSED"] },
            fundedUSD: { type: "number" },
            advanceRate: { type: "number" },
            bondHbar: { type: "number" },
          },
          required: [
            "id",
            "buyer",
            "amountUSD",
            "maturity",
            "risk",
            "nftId",
            "ftId",
            "fileIds",
            "topicId",
            "status",
            "fundedUSD",
            "advanceRate",
          ],
        },
        HcsEvent: {
          type: "object",
          properties: { type: { type: "string" }, ts: { type: "string" } },
          additionalProperties: true,
          required: ["type", "ts"],
        },
        InvoicesResponse: {
          type: "object",
          properties: { invoices: { type: "array", items: { $ref: "#/components/schemas/Invoice" } } },
        },
        InvoiceResponse: { type: "object", properties: { invoice: { $ref: "#/components/schemas/Invoice" } } },
        EventsResponse: {
          type: "object",
          properties: { events: { type: "array", items: { $ref: "#/components/schemas/HcsEvent" } } },
        },
        InvestRequest: {
          type: "object",
          properties: {
            amountUnits: { type: "integer", description: "FT units (cents if decimals=2)" },
            investorAccountId: { type: "string" },
            txMemo: { type: "string" },
          },
          required: ["amountUnits", "investorAccountId"],
          additionalProperties: false,
        },
        PayoutRequest: {
          type: "object",
          properties: { amountPaid: { type: "number" }, buyerPaymentTxn: { type: "string" } },
          required: ["amountPaid", "buyerPaymentTxn"],
          additionalProperties: false,
        },
        PostBondRequest: {
          type: "object",
          properties: { invoiceId: { type: "string" }, amountHbar: { type: "number" } },
          required: ["invoiceId", "amountHbar"],
          additionalProperties: false,
        },
        RegisterAttester: {
          type: "object",
          properties: { orgName: { type: "string" }, contact: { type: "string" }, bondHbar: { type: "number" } },
          required: ["orgName", "bondHbar"],
          additionalProperties: false,
        },
        AttesterRegistered: { type: "object", properties: { ok: { type: "boolean" }, attesterId: { type: "string" } } },
        AttesterSignRequest: {
          type: "object",
          properties: {
            invoiceId: { type: "string" },
            type: { type: "string" },
            milestone: { type: "string" },
            notes: { type: "string" },
            timestamp: { type: "string" },
          },
          required: ["invoiceId"],
          additionalProperties: true,
        },
        BuyerAckRequest: {
          type: "object",
          properties: { invoiceId: { type: "string" }, byAccountId: { type: "string" } },
          required: ["invoiceId"],
          additionalProperties: false,
        },
        ResultInvoice: {
          type: "object",
          properties: { ok: { type: "boolean" }, invoice: { $ref: "#/components/schemas/Invoice" } },
        },
        PortfolioResponse: {
          type: "object",
          properties: {
            portfolio: {
              type: "object",
              properties: {
                positions: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      id: { type: "string" },
                      value: { type: "number" },
                      estReturn: { type: "number" },
                      maturity: { type: "string" },
                      risk: { enum: ["green", "yellow", "red"] },
                    },
                  },
                },
                payoutsToday: { type: "number" },
                irr: { type: "number" },
                delinquency: { type: "number" },
                defaults: { type: "number" },
                invested: { type: "number" },
                estReturnTotal: { type: "number" },
              },
            },
          },
        },
        AnalyticsEvent: {
          type: "object",
          properties: { name: { type: "string" }, props: { type: "object" }, ts: { type: "string" } },
          required: ["name", "ts"],
        },
        CreateInvoiceForm: {
          type: "object",
          properties: {
            buyer: { type: "string" },
            amountUSD: { type: "number" },
            maturity: { type: "string" },
            risk: { enum: ["green", "yellow", "red"] },
            fileNames: { type: "string", description: "JSON string of filenames" },
          },
          required: ["buyer", "amountUSD", "maturity", "risk", "fileNames"],
        },
      },
    },
  }
  return NextResponse.json(spec)
}
