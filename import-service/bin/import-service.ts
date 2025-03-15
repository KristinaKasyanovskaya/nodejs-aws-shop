import * as cdk from "aws-cdk-lib";
import { ImportServiceStack } from "../lib/import-service-stack";
import { App } from "aws-cdk-lib";

const app = new App();
new ImportServiceStack(app, "ImportServiceStack");