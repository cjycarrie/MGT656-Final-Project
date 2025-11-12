"""Compatibility shim: empty `logs` package.

Render previously attempted to import a top-level `logs` package. Create an empty
package here so imports won't fail. This is a short-term fix; ideally remove any
reference to `logs` in settings or code instead of relying on this shim.
"""
