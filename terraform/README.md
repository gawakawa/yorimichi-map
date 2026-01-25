# Terraform Module

## Overview

This module provides...

<!-- BEGIN_TF_DOCS -->
## Requirements

| Name | Version |
|------|---------|
| <a name="requirement_terraform"></a> [terraform](#requirement\_terraform) | >= 1.0 |
| <a name="requirement_google"></a> [google](#requirement\_google) | ~> 7.16 |

## Providers

| Name | Version |
|------|---------|
| <a name="provider_google"></a> [google](#provider\_google) | 7.16.0 |

## Modules

No modules.

## Resources

| Name | Type |
|------|------|
| [google_billing_budget.monthly](https://registry.terraform.io/providers/hashicorp/google/latest/docs/resources/billing_budget) | resource |
| [google_project_service.secretmanager](https://registry.terraform.io/providers/hashicorp/google/latest/docs/resources/project_service) | resource |
| [google_storage_bucket.tfstate](https://registry.terraform.io/providers/hashicorp/google/latest/docs/resources/storage_bucket) | resource |
| [google_billing_account.account](https://registry.terraform.io/providers/hashicorp/google/latest/docs/data-sources/billing_account) | data source |
| [google_project.project](https://registry.terraform.io/providers/hashicorp/google/latest/docs/data-sources/project) | data source |

## Inputs

| Name | Description | Type | Default | Required |
|------|-------------|------|---------|:--------:|
| <a name="input_billing_account_id"></a> [billing\_account\_id](#input\_billing\_account\_id) | GCP billing account ID (format: XXXXXX-XXXXXX-XXXXXX) | `string` | n/a | yes |
| <a name="input_project_id"></a> [project\_id](#input\_project\_id) | GCP project ID | `string` | `"yorimichi-map-485411"` | no |
| <a name="input_region"></a> [region](#input\_region) | GCP region | `string` | `"asia-northeast1"` | no |
| <a name="input_zone"></a> [zone](#input\_zone) | GCP zone | `string` | `"asia-northeast1-a"` | no |

## Outputs

No outputs.
<!-- END_TF_DOCS -->

## Usage

```hcl
module "example" {
  source = "./"
}
```
