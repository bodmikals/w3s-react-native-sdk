// Copyright (c) 2024, Circle Internet Financial, LTD. All rights reserved.
//
// SPDX-License-Identifier: Apache-2.0
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
import WalletSdkModule from './ProgrammablewalletRnSdkModule'

import {
  DeviceEventEmitter,
  Image,
  NativeEventEmitter,
  NativeModules,
  Platform,
} from 'react-native'
import type { ImageSourcePropType } from 'react-native/Libraries/Image/Image'
import {
  type Configuration,
  type ErrorCode,
  type EventListener,
  type IconTextConfig,
  type IconTextsKey,
  type ImageKey,
  type IWalletSdk,
  type SecurityQuestion,
  type SuccessResult,
  type TextConfig,
  type TextKey,
  type TextsKey,
  type ErrorCallback,
  type SuccessCallback, type Error, DateFormat,
} from './types'
import packageJson from '../package.json'

const { ReactNativeEventEmitter } = NativeModules

if (!WalletSdkModule) {
  throw new Error(`NativeModule: ProgrammablewalletRnSdkModule is null.`)
}
const emitter =
  Platform.OS === 'ios'
    ? new NativeEventEmitter(ReactNativeEventEmitter)
    : DeviceEventEmitter
const EVENT_NAME_ON_EVENT = 'CirclePwOnEvent'
const EVENT_NAME_ON_SUCCESS = 'CirclePwOnSuccess'
const EVENT_NAME_ON_ERROR = 'CirclePwOnError'
export const WalletSdk = ((): IWalletSdk => {
  const constants = WalletSdkModule.getConstants()
  return {
    sdkVersion: {
      native: constants.sdkVersion,
      rn: packageJson.version,
    },
    deviceId: WalletSdkModule.getDeviceId() ?? constants.deviceId,
    init(configuration: Configuration): Promise<void> {
      return WalletSdkModule.initSdk(configuration)
    },
    setSecurityQuestions(securityQuestions: SecurityQuestion[]): void {
      WalletSdkModule.setSecurityQuestions(securityQuestions)
    },
    addListener(listener: EventListener): void {
      emitter.addListener(EVENT_NAME_ON_EVENT, listener)
    },
    removeAllListeners(): void {
      emitter.removeAllListeners(EVENT_NAME_ON_EVENT)
    },
    getDeviceId(): string {
      return WalletSdkModule.getDeviceId()
    },
    execute(
      userToken: string,
      encryptionKey: string,
      challengeIds: string[],
      successCallback: SuccessCallback,
      errorCallback: ErrorCallback
    ): void {
      emitter.addListener(EVENT_NAME_ON_SUCCESS, successCallback)
      emitter.addListener(EVENT_NAME_ON_ERROR, errorCallback)
      WalletSdkModule.execute(userToken, encryptionKey, challengeIds)
        .then((successResult: SuccessResult) => {
          successCallback(successResult)
        })
        .catch((e: Error) => {
          errorCallback(e)
        })
        .finally(() => {
          emitter.removeAllListeners(EVENT_NAME_ON_SUCCESS)
          emitter.removeAllListeners(EVENT_NAME_ON_ERROR)
        })
    },
    executeWithUserSecret(userToken: string, encryptionKey: string, userSecret: string, challengeIds: string[], successCallback: SuccessCallback, errorCallback: ErrorCallback): void {
      emitter.addListener(EVENT_NAME_ON_SUCCESS, successCallback)
      emitter.addListener(EVENT_NAME_ON_ERROR, errorCallback)
      WalletSdkModule.executeWithUserSecret(userToken, encryptionKey, userSecret, challengeIds)
        .then((successResult: SuccessResult) => {
          successCallback(successResult)
        })
        .catch((e: Error) => {
          errorCallback(e)
        })
        .finally(() => {
          emitter.removeAllListeners(EVENT_NAME_ON_SUCCESS)
          emitter.removeAllListeners(EVENT_NAME_ON_ERROR)
        })
    },
    setBiometricsPin(
      userToken: string,
      encryptionKey: string,
      successCallback: SuccessCallback,
      errorCallback: ErrorCallback
    ): void {
      emitter.addListener(EVENT_NAME_ON_SUCCESS, successCallback)
      emitter.addListener(EVENT_NAME_ON_ERROR, errorCallback)
      WalletSdkModule.setBiometricsPin(userToken, encryptionKey)
        .then((successResult: SuccessResult) => {
          successCallback(successResult)
        })
        .catch((e: Error) => {
          errorCallback(e)
        })
        .finally(() => {
          emitter.removeAllListeners(EVENT_NAME_ON_SUCCESS)
          emitter.removeAllListeners(EVENT_NAME_ON_ERROR)
        })
    },
    setDismissOnCallbackMap(map: Map<ErrorCode, boolean>): void {
      try {
        WalletSdkModule.setDismissOnCallbackMap(Object.fromEntries(map))
      } catch (e) {
        console.error(e)
      }
    },
    moveTaskToFront(): void {
      WalletSdkModule.moveTaskToFront()
    },
    moveRnTaskToFront(): void {
      WalletSdkModule.moveRnTaskToFront()
    },
    setTextConfigsMap(map: Map<TextsKey, TextConfig[]>): void {
      try {
        WalletSdkModule.setTextConfigsMap(Object.fromEntries(map))
      } catch (e) {
        console.error(e)
      }
    },
    setIconTextConfigsMap(
      rawMap: Map<IconTextsKey, Array<IconTextConfig>>
    ): void {
      try {
        const map = {}
        for (const [key, configs] of rawMap) {
          const newConfigs = []
          for (const config of configs) {
            const url = getImageUrl(config.image)
            newConfigs.push({ image: url, textConfig: config.textConfig })
          }
          // @ts-ignore
          map[key] = newConfigs
        }
        console.log('IconTextConfigs_map:' + JSON.stringify(map))
        WalletSdkModule.setIconTextConfigsMap(map)
      } catch (e) {
        console.error(e)
      }
    },
    setTextConfigMap(map: Map<TextKey, TextConfig>): void {
      try {
        WalletSdkModule.setTextConfigMap(Object.fromEntries(map))
      } catch (e) {
        console.error(e)
      }
    },
    setImageMap(rawMap: Map<ImageKey, ImageSourcePropType>): void {
      try {
        const map = {}
        for (const [key, value] of rawMap) {
          // @ts-ignore
          const url = getImageUrl(value)
          if (url == null) {
            continue
          }
          // @ts-ignore
          map[key] = url
        }
        console.log('Image_map:' + JSON.stringify(map))
        WalletSdkModule.setImageMap(map)
      } catch (e) {
        console.error(e)
      }
    },
    setDateFormat(format: DateFormat): void {
      WalletSdkModule.setDateFormat(format)
    },
    setDebugging(debugging: boolean): void {
      WalletSdkModule.setDebugging(debugging)
    },
    setCustomUserAgent(userAgent: string): void {
      WalletSdkModule.setCustomUserAgent(userAgent)
    },
    setErrorStringMap(map: Map<ErrorCode, string>): void {
      try {
        WalletSdkModule.setErrorStringMap(Object.fromEntries(map))
      } catch (e) {
        console.error(e)
      }
    }
  }
})()

function getImageUrl(source: ImageSourcePropType): string | null {
  if (!source) {
    return null
  }
  // @ts-ignore
  const resolved = Image.resolveAssetSource(source)
  if (!resolved || !resolved.uri) {
    return null
  }
  // @ts-ignore
  return resolved.uri
}
