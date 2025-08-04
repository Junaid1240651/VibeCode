import {Sandbox} from '@e2b/code-interpreter'

export const getSandBox = async (sandBoxId: string) => {
    const sandBox = await Sandbox.connect(sandBoxId)
  return sandBox
}
