# Terraform Module

## Overview

This module provides...

<!-- markdownlint-disable MD033 MD060 -->
<!-- BEGIN_TF_DOCS -->
## Requirements

| Name | Version |
|------|---------|
| <a name="requirement_terraform"></a> [terraform](#requirement\_terraform) | >= 1.0 |
| <a name="requirement_cloudflare"></a> [cloudflare](#requirement\_cloudflare) | ~> 5.17 |
| <a name="requirement_google"></a> [google](#requirement\_google) | ~> 7.16 |

## Providers

| Name | Version |
|------|---------|
| <a name="provider_cloudflare"></a> [cloudflare](#provider\_cloudflare) | 5.17.0 |
| <a name="provider_google"></a> [google](#provider\_google) | 7.19.0 |

## Modules

No modules.

## Resources

| Name | Type |
|------|------|
| [cloudflare_dns_record.backend](https://registry.terraform.io/providers/cloudflare/cloudflare/latest/docs/resources/dns_record) | resource |
| [cloudflare_dns_record.frontend](https://registry.terraform.io/providers/cloudflare/cloudflare/latest/docs/resources/dns_record) | resource |
| [google_artifact_registry_repository.docker](https://registry.terraform.io/providers/hashicorp/google/latest/docs/resources/artifact_registry_repository) | resource |
| [google_artifact_registry_repository_iam_member.github_actions_writer](https://registry.terraform.io/providers/hashicorp/google/latest/docs/resources/artifact_registry_repository_iam_member) | resource |
| [google_billing_budget.monthly](https://registry.terraform.io/providers/hashicorp/google/latest/docs/resources/billing_budget) | resource |
| [google_cloud_run_domain_mapping.backend](https://registry.terraform.io/providers/hashicorp/google/latest/docs/resources/cloud_run_domain_mapping) | resource |
| [google_cloud_run_domain_mapping.frontend](https://registry.terraform.io/providers/hashicorp/google/latest/docs/resources/cloud_run_domain_mapping) | resource |
| [google_cloud_run_v2_service.backend](https://registry.terraform.io/providers/hashicorp/google/latest/docs/resources/cloud_run_v2_service) | resource |
| [google_cloud_run_v2_service.frontend](https://registry.terraform.io/providers/hashicorp/google/latest/docs/resources/cloud_run_v2_service) | resource |
| [google_cloud_run_v2_service_iam_member.backend_public](https://registry.terraform.io/providers/hashicorp/google/latest/docs/resources/cloud_run_v2_service_iam_member) | resource |
| [google_cloud_run_v2_service_iam_member.frontend_public](https://registry.terraform.io/providers/hashicorp/google/latest/docs/resources/cloud_run_v2_service_iam_member) | resource |
| [google_iam_workload_identity_pool.github](https://registry.terraform.io/providers/hashicorp/google/latest/docs/resources/iam_workload_identity_pool) | resource |
| [google_iam_workload_identity_pool_provider.github](https://registry.terraform.io/providers/hashicorp/google/latest/docs/resources/iam_workload_identity_pool_provider) | resource |
| [google_monitoring_alert_policy.backend_error_rate](https://registry.terraform.io/providers/hashicorp/google/latest/docs/resources/monitoring_alert_policy) | resource |
| [google_monitoring_alert_policy.backend_high_request_count](https://registry.terraform.io/providers/hashicorp/google/latest/docs/resources/monitoring_alert_policy) | resource |
| [google_monitoring_notification_channel.email](https://registry.terraform.io/providers/hashicorp/google/latest/docs/resources/monitoring_notification_channel) | resource |
| [google_project_iam_member.cloudrun_artifact_reader](https://registry.terraform.io/providers/hashicorp/google/latest/docs/resources/project_iam_member) | resource |
| [google_project_iam_member.cloudrun_vertex_ai_user](https://registry.terraform.io/providers/hashicorp/google/latest/docs/resources/project_iam_member) | resource |
| [google_project_iam_member.github_actions_run_developer](https://registry.terraform.io/providers/hashicorp/google/latest/docs/resources/project_iam_member) | resource |
| [google_project_service.aiplatform](https://registry.terraform.io/providers/hashicorp/google/latest/docs/resources/project_service) | resource |
| [google_project_service.artifactregistry](https://registry.terraform.io/providers/hashicorp/google/latest/docs/resources/project_service) | resource |
| [google_project_service.containerscanning](https://registry.terraform.io/providers/hashicorp/google/latest/docs/resources/project_service) | resource |
| [google_project_service.iam](https://registry.terraform.io/providers/hashicorp/google/latest/docs/resources/project_service) | resource |
| [google_project_service.iamcredentials](https://registry.terraform.io/providers/hashicorp/google/latest/docs/resources/project_service) | resource |
| [google_project_service.run](https://registry.terraform.io/providers/hashicorp/google/latest/docs/resources/project_service) | resource |
| [google_project_service.secretmanager](https://registry.terraform.io/providers/hashicorp/google/latest/docs/resources/project_service) | resource |
| [google_secret_manager_secret.django_secret_key](https://registry.terraform.io/providers/hashicorp/google/latest/docs/resources/secret_manager_secret) | resource |
| [google_secret_manager_secret.maps_api_key](https://registry.terraform.io/providers/hashicorp/google/latest/docs/resources/secret_manager_secret) | resource |
| [google_secret_manager_secret_iam_member.cloudrun_maps_api_key_access](https://registry.terraform.io/providers/hashicorp/google/latest/docs/resources/secret_manager_secret_iam_member) | resource |
| [google_secret_manager_secret_iam_member.cloudrun_secret_access](https://registry.terraform.io/providers/hashicorp/google/latest/docs/resources/secret_manager_secret_iam_member) | resource |
| [google_service_account.cloudrun](https://registry.terraform.io/providers/hashicorp/google/latest/docs/resources/service_account) | resource |
| [google_service_account.github_actions](https://registry.terraform.io/providers/hashicorp/google/latest/docs/resources/service_account) | resource |
| [google_service_account_iam_member.github_actions_act_as_cloudrun](https://registry.terraform.io/providers/hashicorp/google/latest/docs/resources/service_account_iam_member) | resource |
| [google_service_account_iam_member.github_actions_workload_identity](https://registry.terraform.io/providers/hashicorp/google/latest/docs/resources/service_account_iam_member) | resource |
| [google_storage_bucket.tfstate](https://registry.terraform.io/providers/hashicorp/google/latest/docs/resources/storage_bucket) | resource |
| [cloudflare_zone.main](https://registry.terraform.io/providers/cloudflare/cloudflare/latest/docs/data-sources/zone) | data source |
| [google_project.project](https://registry.terraform.io/providers/hashicorp/google/latest/docs/data-sources/project) | data source |

## Inputs

| Name | Description | Type | Default | Required |
|------|-------------|------|---------|:--------:|
| <a name="input_cloudflare_api_token"></a> [cloudflare\_api\_token](#input\_cloudflare\_api\_token) | Cloudflare API token with Zone:DNS:Edit and Zone:Zone:Read permissions | `string` | n/a | yes |
| <a name="input_alert_email"></a> [alert\_email](#input\_alert\_email) | Email address for monitoring alerts | `string` | `""` | no |
| <a name="input_domain_name"></a> [domain\_name](#input\_domain\_name) | Root domain name | `string` | `"i0ta.dev"` | no |
| <a name="input_project_id"></a> [project\_id](#input\_project\_id) | GCP project ID | `string` | `"yorimichi-map-485411"` | no |
| <a name="input_region"></a> [region](#input\_region) | GCP region | `string` | `"asia-northeast1"` | no |
| <a name="input_subdomain"></a> [subdomain](#input\_subdomain) | Subdomain prefix for the application | `string` | `"yorimichi"` | no |
| <a name="input_zone"></a> [zone](#input\_zone) | GCP zone | `string` | `"asia-northeast1-a"` | no |

## Outputs

| Name | Description |
|------|-------------|
| <a name="output_artifact_registry_url"></a> [artifact\_registry\_url](#output\_artifact\_registry\_url) | Artifact Registry repository URL |
| <a name="output_backend_custom_domain"></a> [backend\_custom\_domain](#output\_backend\_custom\_domain) | Backend API custom domain URL |
| <a name="output_backend_url"></a> [backend\_url](#output\_backend\_url) | Backend Cloud Run service URL |
| <a name="output_frontend_custom_domain"></a> [frontend\_custom\_domain](#output\_frontend\_custom\_domain) | Frontend custom domain URL |
| <a name="output_frontend_url"></a> [frontend\_url](#output\_frontend\_url) | Frontend Cloud Run service URL |
| <a name="output_github_actions_service_account"></a> [github\_actions\_service\_account](#output\_github\_actions\_service\_account) | Service account email for GitHub Actions |
| <a name="output_workload_identity_provider"></a> [workload\_identity\_provider](#output\_workload\_identity\_provider) | Workload Identity Provider resource name for GitHub Actions |
<!-- END_TF_DOCS -->
<!-- markdownlint-enable MD033 MD060 -->

## Usage

```hcl
module "example" {
  source = "./"
}
```
