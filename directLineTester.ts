import * as axios from 'axios';

export class DirectLineTester {
    private token: string;
    private conversationId: string;
    public constructor(token: string) {
        this.token = token;
    }

    private MessagesEqual(messages1: string[], messages2: string[]) {
        if (!messages1 || !messages2) {
            return false;
        }
        if (messages1.length !== messages2.length) {
            return false;
        }
        for (let i = 0; i < messages1.length; i++) {
            if (messages1[i] !== messages2[i]) {
                return false;
            }
        }
        return true;
    }

    public async createConversation() {
        const endpoint = 'https://directline.botframework.com/v3/directline/conversations';
        const response = await axios.default({
            url: endpoint,
            method: "POST",
            headers: {
                Authorization: `Bearer ${this.token}`
            }
        })
        if (!this.conversationId) {
            this.conversationId = response.data.conversationId;
        }
        return response.data;
    }

    public async sendMessage(text: string) {
        let retryCount = 2;
        while (retryCount > 0) {
            try {
                if (!this.conversationId) {
                    await this.createConversation();
                }
                const endpoint = `https://directline.botframework.com/v3/directline/conversations/${this.conversationId}/activities`;
                const response = await axios.default({
                    url: endpoint,
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${this.token}`
                    },
                    data: {
                        locale: "en-EN",
                        type: "message",
                        from: {
                            id: "test_user"
                        },
                        text: text
                    }
                })
                return response.data;
            }
            catch (error) {
                console.log("%O", error);
                retryCount--;
            }
        }
        return undefined;
    }


    public async getLatestResponse() {
        if (!this.conversationId) {
            await this.createConversation();
        }
        const endpoint = `https://directline.botframework.com/v3/directline/conversations/${this.conversationId}/activities`;
        const response = await axios.default({
            url: endpoint,
            method: "GET",
            headers: {
                Authorization: `Bearer ${this.token}`
            }
        })
        return response.data;
    }

    public async SendAndAssert(messageToSend: string, messagesToReceive: string[]) {
        const messageId = await this.sendMessage(messageToSend);
        const allActivitiesResult = await this.getLatestResponse();
        const activities = allActivitiesResult.activities as Array<any>;
        const replyToActivities = activities.filter((element) => {
            return element.replyToId === messageId.id;
        }).map(element => element.text);
        return this.MessagesEqual(messagesToReceive, replyToActivities);
    }

    public async SendAndGetMessages(messageToSend: string): Promise<string[]> {
        const messageId = await this.sendMessage(messageToSend);
        const allActivitiesResult = await this.getLatestResponse();
        const activities = allActivitiesResult.activities as Array<any>;
        const replyToActivities = activities.filter((element) => {
            return element.replyToId === messageId.id;
        }).map(element => element.text);
        return replyToActivities;
    }
}
