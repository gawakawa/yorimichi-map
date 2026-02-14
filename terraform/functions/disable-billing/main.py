"""Cloud Function to disable billing when budget is exceeded."""

import base64
import json
import os

import functions_framework
from cloudevents.http import CloudEvent
from google.cloud import billing_v1


@functions_framework.cloud_event
def disable_billing(cloud_event: CloudEvent) -> None:
    """Disable billing for the project when budget is exceeded.

    This function is triggered by a Pub/Sub message from Cloud Billing Budget.
    When costAmount >= budgetAmount, it unlinks the billing account from the project.
    """
    project_id = os.environ.get("GCP_PROJECT_ID")
    if not project_id:
        print("ERROR: GCP_PROJECT_ID environment variable is not set")
        return

    pubsub_message = cloud_event.data.get("message", {})
    message_data = pubsub_message.get("data", "")

    if not message_data:
        print("ERROR: No data in Pub/Sub message")
        return

    try:
        budget_notification = json.loads(base64.b64decode(message_data).decode("utf-8"))
    except (json.JSONDecodeError, ValueError) as e:
        print(f"ERROR: Failed to decode message: {e}")
        return

    budget_display_name = budget_notification.get("budgetDisplayName", "Unknown")
    cost_amount = budget_notification.get("costAmount", 0)
    budget_amount = budget_notification.get("budgetAmount", 0)

    print(f"Budget: {budget_display_name}")
    print(f"Cost: {cost_amount}, Budget: {budget_amount}")

    if cost_amount < budget_amount:
        print(f"Cost ({cost_amount}) is below budget ({budget_amount}). No action taken.")
        return

    print(f"Cost ({cost_amount}) exceeds budget ({budget_amount}). Disabling billing...")

    client = billing_v1.CloudBillingClient()
    project_name = f"projects/{project_id}"

    try:
        project_billing_info = client.get_project_billing_info(name=project_name)

        if not project_billing_info.billing_enabled:
            print(f"Billing is already disabled for project {project_id}")
            return

        project_billing_info.billing_account_name = ""
        client.update_project_billing_info(
            name=project_name,
            project_billing_info=project_billing_info,
        )
        print(f"Billing disabled for project {project_id}")

    except Exception as e:
        print(f"ERROR: Failed to disable billing: {e}")
        raise
