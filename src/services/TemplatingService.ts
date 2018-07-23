import { messaging as firebaseMessaging } from 'firebase-admin';
import Mustache from 'mustache';
import winston from 'winston';
import Mail from '@/interfaces/Mail';
import Template from '@/interfaces/Template';
import LanguagePayload from '@/interfaces/LanguagePayload';
import UserRessource from '@/interfaces/UserRessource';
import Utils from '@/utils';
import Payload from '@/interfaces/Payload';

const MAIL_MESSAGE = 'MAIL';
const PUSH_MESSAGE = 'PUSH';

export default class TemplatingService {
  // region public static methods
  // endregion

  // region private static methods
  private static initializeMessageTemplates(platformId: string, templateId: string): Template[] {
    return [MAIL_MESSAGE, PUSH_MESSAGE].map((type) => {
      const messageTemplate = Utils.loadTemplate(platformId, templateId, type);
      TemplatingService.parseMessageTemplate(messageTemplate);
      return messageTemplate;
    });
  }

  private static parseMessageTemplate(template: Template) {
    for (const key in template) {
      if (template.hasOwnProperty(key)) {
        const value = template[key];

        if (typeof value === 'object') {
          this.parseMessageTemplate(value);
        } else if (typeof value === 'string') {
          Mustache.parse(value);
        }
      }
    }
  }

  private static renderMessageTemplate(template: Template, payload: Payload): Template {
    const compiledTemplate = Object.assign({}, template);
    for (const key in compiledTemplate) {
      if (compiledTemplate.hasOwnProperty(key)) {
        const value = compiledTemplate[key];

        if (typeof value === 'object') {
          compiledTemplate[key] = this.renderMessageTemplate(value, payload);
        } else if (typeof value === 'string') {
          compiledTemplate[key] = Mustache.render(value, payload);
        }
      }
    }
    return compiledTemplate;
  }

  private static initializeMessagePayloads(payload: any, languagePayloads: LanguagePayload[]): Payload[] {
    return languagePayloads.map((languagePayload: LanguagePayload): Payload => {
      return {
        message: payload,
        languageId: languagePayload.language,
        language: languagePayload.payload,
        user: {},
      };
    });
  }
  // endregion

  // region public members
  // endregion

  // region private members

  private parsedMessageTemplates: Template[];
  private messagePayloads: Payload[];

  // endregion

  // region constructor

  public constructor(platformId: string, templateId: string, payload: {}, languagePayloads: LanguagePayload[]) {
    this.parsedMessageTemplates = TemplatingService.initializeMessageTemplates(platformId, templateId);
    this.messagePayloads = TemplatingService.initializeMessagePayloads(payload, languagePayloads);
  }

  // endregion

  // region public methods

  public createMailMessage(user: UserRessource): Mail {
    const template = this.getTemplate(MAIL_MESSAGE);
    const payload = this.getUserPayload(user);
    const renderedTemplate = TemplatingService.renderMessageTemplate(template, payload);

    const mail = {
      from: renderedTemplate.from,
      to: user.mail,
      subject: renderedTemplate.subject,
      text: renderedTemplate.text,
      html: renderedTemplate.html,
    };
    return mail;
  }

  public createPushMessage(user: UserRessource, device: string): firebaseMessaging.Message {

    const template = this.getTemplate(PUSH_MESSAGE);
    const payload = this.getUserPayload(user);
    const renderedTemplate = TemplatingService.renderMessageTemplate(template, payload);
    const push = {
      token: device,
      data: renderedTemplate.data,
      notification: renderedTemplate.notification,
      android: renderedTemplate.android,
      webpush: renderedTemplate.webpush,
      apns: renderedTemplate.apns,
    };
    return push;
  }

  // endregion

  // region private methods
  private getTemplate(type: string): Template {
    const parsedMessageTemplate = this.parsedMessageTemplates.find( (template) => {
      return template.type === type;
    } );

    if (!parsedMessageTemplate) {
      const errorMessage = `Could not find message template for type ${type}`;
      winston.error(errorMessage);
      throw new Error(errorMessage);
    }

    return parsedMessageTemplate;
  }

  private getUserPayload(user: UserRessource): Payload {
    const messagePayload = this.messagePayloads.find( (payload) => payload.languageId === user.language );

    if (!messagePayload) {
      const errorMessage = `Could not find message payload for language ${user.language}`;
      winston.error(errorMessage);
      throw new Error(errorMessage);
    }

    messagePayload.user = user.payload;
    return messagePayload;
  }
  // endregion
}