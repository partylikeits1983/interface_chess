import { createHelia } from 'helia';
import { dagJson } from '@helia/dag-json';

// Our custom types
type MyCID = string;
type LinkedObject = {
  link: MyCID;
};

export async function setToIPFS(key: string, value: object): Promise<MyCID> {
  const helia = await createHelia();
  const d = dagJson(helia);

  // Create an object with the key and value.
  const object1 = { [key]: value };
  const myImmutableAddress1: MyCID = await d.add(object1);

  // Wrap the CID in another object and store it again.
  const object2: LinkedObject = { link: myImmutableAddress1 };
  const myImmutableAddress2: MyCID = await d.add(object2);

  return myImmutableAddress2;
}

export async function getFromIPFS(cid: MyCID): Promise<object> {
  const helia = await createHelia();
  const d = dagJson(helia);

  const retrievedObject: LinkedObject = (await d.get(cid)) as LinkedObject;

  // Check if the retrieved object has the expected structure
  if (retrievedObject && typeof retrievedObject.link === 'string') {
    return await d.get(retrievedObject.link);
  } else {
    throw new Error('Unexpected data format retrieved from IPFS.');
  }
}
