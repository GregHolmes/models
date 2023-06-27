import * as Ably from 'ably';
import { Types } from 'ably';
import Model, { ModelOptions } from './Model.js';
import Stream, { StreamOptions } from './Stream.js';

class Models {
  private models: Record<string, Model<any>>;
  private streams: Record<string, Stream>;
  ably: Types.RealtimePromise;

  readonly version = '0.0.1';

  constructor(optionsOrAbly: Types.RealtimePromise | Types.ClientOptions | string) {
    this.models = {};
    this.streams = {};
    if (optionsOrAbly['options']) {
      this.ably = optionsOrAbly as Types.RealtimePromise;
      this.addAgent(this.ably['options'], false);
    } else {
      let options: Types.ClientOptions = typeof optionsOrAbly === 'string' ? { key: optionsOrAbly } : optionsOrAbly;
      this.addAgent(options, true);
      this.ably = new Ably.Realtime.Promise(options);
    }
    this.ably.time();
  }

  private addAgent(options: any, isDefault: boolean) {
    const agent = `ably-models/${this.version}`;
    const clientType = isDefault ? 'model-default-client' : 'model-custom-client';
    if (!options.agents) {
      options.agents = [agent, clientType];
    } else if (!options.agents.includes(agent)) {
      options.agents.push(agent, clientType);
    }
  }

  Model = <T>(name: string, options: ModelOptions<T>) => {
    if (typeof name !== 'string' || name.length === 0) {
      throw new Error('Model must have a non-empty name');
    }

    if (this.models[name]) return this.models[name];

    const model = new Model<T>(name, options);
    this.models[name] = model;

    return model;
  };

  Stream = (name: string, options?: StreamOptions) => {
    if (typeof name !== 'string' || name.length === 0) {
      throw new Error('Stream must have a non-empty name');
    }

    if (this.streams[name]) return this.streams[name];

    if (!options) {
      throw new Error('Stream cannot be instantiated without options');
    }

    const stream = new Stream(name, this.ably, options);
    this.streams[name] = stream;

    return stream;
  };
}

export default Models;
