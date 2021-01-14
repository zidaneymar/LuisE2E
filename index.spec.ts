import { AzureTokenManager } from "./azureTokenManager";
import { ComposerApi } from './composerApi';
import { DirectLineTester } from "./directLineTester";

jest.setTimeout(1000 * 60 * 10);
const directlineToken = '';

function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

test('could publish luis bot', async () => {
    const publishResult = await PublishLuisBot();
    expect(publishResult).toBeTruthy();
})

describe('bot works properly', async () => {
    test('add todo flow', async () => {
        const tester = new DirectLineTester(directlineToken);
        const result1 = await tester.SendAndGetMessages('add');
        expect(result1[0]).toBe("What would you like to add?");
        const result2 = await tester.SendAndGetMessages('abcdefg');
        expect(result2[0]).toBe("Pick a list to add the item to..");
        const result3 = await tester.SendAndGetMessages('todo');
        expect(result3[0]).toBe("Sure. I've added **abcdefg** to **todo** list. You have 1 items in your list.");
    })

    test('add todo flow', async () => {
        const tester = new DirectLineTester(directlineToken);
        const result1 = await tester.SendAndGetMessages('add');
        expect(result1[0]).toBe("What would you like to add?");
        const result2 = await tester.SendAndGetMessages('abcdefg');
        expect(result2[0]).toBe("Pick a list to add the item to..");
        const result3 = await tester.SendAndGetMessages('todo');
        expect(result3[0]).toBe("Sure. I've added **abcdefg** to **todo** list. You have 1 items in your list.");
    })
})

async function PublishLuisBot() {
    const composerAPI = new ComposerApi();
    // const createResult = await composerAPI.CreateLuisBotProject();
    // const botName = createResult.botName;
    // const botId = createResult.id;
    const azureTokenManager = new AzureTokenManager();
    const tokenResponse = await azureTokenManager.GetAccessToken();
    const jsonResult = JSON.parse(tokenResponse);
    const token = jsonResult.accessToken;
    const botName = 'ToDoBotWithLuisSample-37';
    const botId = '55586.955975498255';
    const targetName = 'testPublish';
    const updateSettingsResult = await composerAPI.SetAppSettings(token, botId, botName, targetName);
    console.log(`update result: ${updateSettingsResult}`);

    if (!updateSettingsResult) {
        return false;
    }
    const startPublishResult = await composerAPI.StartPublish(token, botId, botName, targetName);
    console.log(`start publish result: ${startPublishResult}`);
    if (!startPublishResult) {
        return undefined;
    }

    let message = undefined;
    while (message !== 'Success') {

        const statusResult = await composerAPI.GetPublishStatus(botId, targetName);
        console.log(statusResult);
        if (!statusResult) {
            return false;
        }
        message = statusResult;
        await sleep(5000);
    }
    return true;
}