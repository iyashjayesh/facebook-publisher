import { FrontendAction, HumanInTheLoop } from "@copilotkit/react-core";

export const publishTextPostAction: FrontendAction<{
    pageId: string;
    pageToken: string;
    message: string;
}> = {
    name: "publishTextPost",
    description: "Publish a text-only post to Facebook",
    parameters: {
        type: "object",
        properties: {
            pageId: {
                type: "string",
                description: "The ID of the Facebook page",
            },
            pageToken: {
                type: "string",
                description: "The access token for the Facebook page",
            },
            message: {
                type: "string",
                description: "The text content to post",
            },
        },
        required: ["pageId", "pageToken", "message"],
    },
    implementation: async ({ pageId, pageToken, message }, humanInTheLoop: HumanInTheLoop) => {
        try {
            // First, ask for user confirmation
            await humanInTheLoop.info({
                message: `Preparing to post: "${message}"\nTo page ID: ${pageId}`
            });

            const shouldProceed = await humanInTheLoop.confirm({
                message: "Would you like to proceed with posting?",
                choices: ["Yes", "No"],
            });

            if (shouldProceed !== "Yes") {
                await humanInTheLoop.info({
                    message: "Post cancelled by user.",
                });
                return { success: false, message: "Post cancelled by user" };
            }

            console.log('Sending request to publish text post:', { pageId, messageLength: message.length });
            await humanInTheLoop.info({
                message: "Publishing post..."
            });

            const response = await fetch("/api/copilotkit/actions/publish-text", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    pageId,
                    pageToken,
                    message,
                }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || "Failed to publish post");
            }

            const result = await response.json();

            // Notify the user of success
            await humanInTheLoop.info({
                message: "Post published successfully! ✅",
            });

            return result;
        } catch (error) {
            // Notify the user of failure
            await humanInTheLoop.error({
                message: `Failed to publish post: ${error.message}`,
            });
            throw error;
        }
    }
};