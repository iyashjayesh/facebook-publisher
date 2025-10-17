import { HttpAgent } from "@ag-ui/client";
import {
    CopilotRuntime,
    ExperimentalEmptyAdapter,
    copilotRuntimeNextJSAppRouterEndpoint,
} from "@copilotkit/runtime";
import type { NextApiRequest, NextApiResponse } from "next";

// 1. Use the empty adapter (you can replace it with any service adapter)
const serviceAdapter = new ExperimentalEmptyAdapter();

// 2. Initialize CopilotRuntime with your agent(s)
const runtime = new CopilotRuntime({
    agents: {
        "facebook_publisher_agent": new HttpAgent({ url: "http://localhost:8000/" }),
    },
});

// 3. Create a Next.js Pages Router API route
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    // The helper from CopilotKit to integrate with Next.js Pages API routes
    const { handleRequest } = copilotRuntimeNextJSAppRouterEndpoint({
        runtime,
        serviceAdapter,
        endpoint: "/api/copilotkit",
    });

    return handleRequest(req, res);
}

