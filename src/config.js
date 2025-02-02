const core = require('@actions/core');
const github = require('@actions/github');

class Config {
  constructor() {
    this.input = {
      mode: core.getInput('mode'),
      githubToken: core.getInput('github-token'),
      ec2ImageId: core.getInput('ec2-image-id'),
      ec2InstanceType: core.getInput('ec2-instance-type'),
      securityGroupId: core.getInput('security-group-id'),
      label: core.getInput('label'),
      ec2InstanceId: core.getInput('ec2-instance-id'),
      ec2Os: core.getInput('ec2-os'),
      iamRoleName: core.getInput('iam-role-name'),
      runnerHomeDir: core.getInput('runner-home-dir'),
      awsKeyPairName: core.getInput('aws-key-pair-name'),
      preRunnerScript: core.getInput('pre-runner-script'),
      marketType: core.getInput('market-type')
    };

    const subnetIds = JSON.parse(core.getInput('subnet-id-list'));
    this.subnetIds = null;
    if (subnetIds.length > 0) {
      this.subnetIds = subnetIds;
    }

    const tags = JSON.parse(core.getInput('aws-resource-tags'));
    this.tagSpecifications = null;
    if (tags.length > 0) {
      this.tagSpecifications = [
        { ResourceType: 'instance', Tags: tags },
        { ResourceType: 'volume', Tags: tags },
      ];
    }

    // the values of github.context.repo.owner and github.context.repo.repo are taken from
    // the environment variable GITHUB_REPOSITORY specified in "owner/repo" format and
    // provided by the GitHub Action on the runtime
    this.githubContext = {
      owner: github.context.repo.owner,
      repo: github.context.repo.repo,
    };

    //
    // validate input
    //

    if (!this.input.mode) {
      throw new Error(`The 'mode' input is not specified`);
    }

    if (!this.input.githubToken) {
      throw new Error(`The 'github-token' input is not specified`);
    }

    if (this.input.mode === 'start') {
      if (!this.input.ec2ImageId || !this.input.ec2InstanceType || !this.input.ec2Os || !this.subnetIds || !this.input.securityGroupId) {
        throw new Error(`Not all the required inputs are provided for the 'start' mode`);
      }
      if (this.input.ec2Os !== 'windows' && this.input.ec2Os !== 'linux') {
        throw new Error(`Wrong ec2-os. Allowed values: windows or linux.`);
      }
      if (this.marketType?.length > 0 && this.input.marketType !== 'spot') {
        throw new Error(`Invalid 'market-type' input. Allowed values: spot.`);
      }
    } else if (this.input.mode === 'stop') {
      if (!this.input.label || !this.input.ec2InstanceId) {
        throw new Error(`Not all the required inputs are provided for the 'stop' mode`);
      }
    } else {
      throw new Error('Wrong mode. Allowed values: start, stop.');
    }
  }

  generateUniqueLabel() {
    return Math.random().toString(36).substring(2, 7);
  }
}

try {
  module.exports = new Config();
} catch (error) {
  core.error(error);
  core.setFailed(error.message);
}
